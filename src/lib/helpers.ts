import { MarkdownTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import * as fs from "node:fs";

export async function loadUrl(url: string) {
  const crawlLoader: FirecrawlApp = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_AP_KEY,
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
    content: scrapeResponse.daa.content,
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
  const ectorStore = await MemoryVectorStore.fromDocuments(chunks, embedding);

  return ectorStore.asRetriever();
}

export async function createDocumentChain() {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const outputSchema = z.object({
    summary: z.string().describe("Summary of this webpage"),
    keyContent: z.array(z.string()).describe("Key content of this webpage"),
  });

  const parser = StrcturedOutputParser.fromZodSchema(outputSchema);

  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful assistant helping visually impaired user to interpret and navigate the web. You will be given context of the webpage that the user is visiting, and answer their questions to the best of your ability using only the resources provided. Be verbose, concise, friendly in your response.",
      ],
      ["assistant", "{format_instructions}"],
      [
        "user",
        "Please answer the following questions according to the provided context: \\n{question} \\n{context}",
      ],
    ]),
    model,
    parser,
  ]);

  const formatInstructions = parser.getFormatInstructions();

  return { chain, formatInstructions };
}

export async function getAnswerFromLLM(url: string) {
  const document = await loadUrl(url);
  const markdown = document.markdown;
  const html = document.html;
  const metadata = document.metadata;
  const screenshot = metadata.screenshot;

  const { chain, formatInstructions } = await createDocumentChain();

  const response = await chain.invoke({
    context: markdown,
    question:
      "Please analyze the provided website URL and perform the following tasks. Return the results in JSON format.\n1. Identify the website and its navigation: extract the website name, and list its main navigation items. If there are sub-menus, list them as well.\n2. Summarize the website's overall purpose and key contents under each navigation item.\n3. Suggest the next move for the user based on the provided content, ensuring the suggestion aligns with the website's main focus and the user's potential interests. This could be user's next action or question for you.",
    format_instructions: formatInstructions,
  });

  return { response, metadata, screenshot };
}

getAnswerFromLLM("https://www.abc.net.au/news").then((response) => {
  console.log(response);
  // Save JSON response to a file
  fs.writeFileSync("response.json", JSON.stringify(response, null, 2));
});