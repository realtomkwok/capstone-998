import {FireCrawlLoader} from "@langchain/community/document_loaders/web/firecrawl";
import {MarkdownTextSplitter} from "@langchain/textsplitters";
import {Document} from "@langchain/core/documents";
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import {ChatPromptTemplate, PromptTemplate} from "@langchain/core/prompts";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import {StringOutputParser} from "@langchain/core/output_parsers";
import {z} from "zod";
import {StructuredOutputParser} from "langchain/output_parsers";


export async function loadUrl(url: string, mode: "scrape" | "crawl" = "scrape") {
    const loader = new FireCrawlLoader({
        url: url,
        apiKey: process.env.FIRECRAWL_API_KEY,
        mode: mode,
        params: {
            onlyMainContent: false,     // Only return the main content of the page, excluding the header, footer, etc.
            includeHTML: true,       // Include the HTML content of the page, this will add an `html` field to the response
            screenshot: true,     // Getting the screenshot of the top of the page that is being scraped
        }
    })

    const document = await loader.load()

    console.log(`Metadata: ${document[0].metadata}`)
    return {
        pageContent: document[0].pageContent,
        metadata: document[0].metadata
    }
}

export async function splitMarkdownDocument(content: string, chunkSize: number, chunkOverlap: number) {
    const splitter = new MarkdownTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap
    })

    const splitDocuments = splitter.createDocuments([content])

    console.log(await splitDocuments)
    return await splitDocuments
}

export async function embedDocuments(chunks: Document[], k?: number, searchType?: "similarity" | "mmr") {
    // TODO: Options for different LLM models
    const embedding = new OpenAIEmbeddings()
    const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embedding)

    const retriever = vectorStore.asRetriever()

    console.log(retriever)

    return retriever
}

export async function createDocumentChain(prompt: ChatPromptTemplate) {

    const zodSchema = z.object({
            websiteName: z.string().describe("The name of the website"),
            mainNavigationItems: z.array(z.string()).describe("The main navigation items of the website"),
            summary: z.string().describe("The summary of the website's overall purpose and key contents under each" +
                " navigation item"),
            keyContents: z.array(z.string()).describe("The key contents under each navigation item"),
            nextMove: z.string().describe("Suggest the next move for the user based on the provided content, ensuring the" +
                " suggestion aligns with the website's main focus and the user's potential interests.")
        }
    )

    const parser = StructuredOutputParser.fromZodSchema(zodSchema)

    const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0
    })

    return await createStuffDocumentsChain({
        llm,
        prompt: prompt,
        outputParser: parser
    })
}
