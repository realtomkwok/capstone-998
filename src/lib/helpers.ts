import { MarkdownTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";

export async function loadUrl(url: string) {
  const crawlLoader: FirecrawlApp = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY,
  });

  const scrapeResponse: ScrapeResponse = await crawlLoader.scrapeUrl(url, {
    pageOptions: {
      includeHtml: true,
      replaceAllPathsWithAbsolutePaths: true,
      fullPageScreenshot: true,
      waitFor: 3000,
    },
  });

  return {
    content: scrapeResponse.data.content,
    markdown: scrapeResponse.data.content,
    html: scrapeResponse.data.content,
    linksOnPage: scrapeResponse.data.linksOnPage,
    metadata: {
      title: scrapeResponse.data.metadata.title,
      description: scrapeResponse.data.metadata.description,
      ogTitle: scrapeResponse.data.metadata.ogTitle,
      ogDescription: scrapeResponse.data.metadata.ogDescription,
      ogUrl: scrapeResponse.data.metadata.ogUrl,
      ogImage: scrapeResponse.data.metadata.ogImage,
      ogLocaleAlternate: scrapeResponse.data.metadata.ogLocaleAlternate,
      screenshot: scrapeResponse.data.metadata.screenshot,
      sourceUrl: scrapeResponse.data.metadata.sourceUrl,
      pageStatusCode: scrapeResponse.data.metadata.pageStatusCode,
    },
  };
}

export async function splitMarkdownDocument(
  content: string,
  chunkSize: number,
  chunkOverlap: number,
) {
  // TODO: Try semantic chunking https://github.com/pinecone-io/examples/blob/master/learn/generation/better-rag/02b-semantic-chunking.ipynb

  const splitter = new MarkdownTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
  });

  return splitter.createDocuments([content]);
}

export async function embedDocuments(
  chunks: Document[],
  k?: number,
  searchType?: "similarity" | "mmr",
) {
  // TODO: Options for different LLM models
  const embedding = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embedding);

  return vectorStore.asRetriever();
}

export async function createDocumentChain(
  retriever: VectorStoreRetriever<MemoryVectorStore>,
) {
  //
  // const zodSchema = z.object({
  //         websiteName: z.string().describe("The name of the website"),
  //         mainNavigationItems: z.array(z.string()).describe("The main navigation items of the website"),
  //         summary: z.string().describe("The summary of the website's overall purpose and key contents under each" +
  //             " navigation item"),
  //         keyContents: z.array(z.string()).describe("The key contents under each navigation item"),
  //         nextMove: z.string().describe("Suggest the next move for the user based on the provided content, ensuring the" +
  //             " suggestion aligns with the website's main focus and the user's potential interests.")
  //     }
  // )

  // const parser = StructuredOutputParser.fromZodSchema(zodSchema)

  const parser = new StringOutputParser();

  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
  });

  const formatDocumentsAsString = (documents: Document[]) => {
    return documents.map((document) => document.pageContent).join("\n\n");
  };

  const SYSTEM_TEMPLATE: string = `You are a helpful assistant helping visually impaired user to interpret and navigate the web. You will be given context of the webpage that the user is visiting, and answer their questions to the best of your ability using only the resources provided. Be verbose, concise, friendly in your response.
    --------------
    {context}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{question"],
  ]);

  return RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    parser,
  ]);
}
