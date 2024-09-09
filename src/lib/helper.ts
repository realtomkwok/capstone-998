import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js"
import { z } from "zod"
import { StructuredOutputParser } from "langchain/output_parsers"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ASSISTANT_MSG, INITIAL_QUESTION, SYSTEM_MSG } from "@lib/prompts"
import { LLMProvider, LLMOutput } from "@lib/interface"
import { OUTPUT_SCHEMES } from "./responses"
import { PageData } from "./interface"

/**
 * Loads and scrapes the content of a given URL using FirecrawlApp.
 * @param url The URL to scrape
 * @returns An object containing the scraped content, metadata, and links on the page
 */

export async function loadUrl(url: string): Promise<PageData> {
	// Log the URL being loaded
	console.log(`Starting to load URL: ${url}`);

	const crawlLoader: FirecrawlApp = new FirecrawlApp({
		apiKey: process.env.FIRECRAWL_API_KEY,
	});

	// TODO: Add error handling for invalid URLs
	const scrapeResponse: ScrapeResponse = await crawlLoader
		.scrapeUrl(url, {
			pageOptions: {
				includeHtml: true,
				replaceAllPathsWithAbsolutePaths: true,
				fullPageScreenshot: true,
				waitFor: 1000,
			},
		})
		.finally(() => {
			console.log(`URL loaded: ${url}`);
			console.log(scrapeResponse);
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

/**
 * Splits the retrieved Markdown document into smaller chunks.
 * @param content The markdown content to split
 * @param chunkSize The size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @returns An array of Document objects representing the chunks
 */

export async function splitDocument(rawHtml: string, rawMarkdown: string, chunkSize: number, chunkOverlap: number) {
    const htmlSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
    })

    const markdownSplitter = new MarkdownTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
    })

    const htmlDocuments = await htmlSplitter.createDocuments([rawHtml])
    const markdownDocuments = await markdownSplitter.createDocuments([rawMarkdown])

    return [...htmlDocuments, ...markdownDocuments]
}

/**
 * Embeds documents into a vector store for efficient retrieval.
 * @param chunks An array of Document objects to embed
 * @param k Optional parameter for the number of results to retrieve
 * @param searchType Optional parameter to specify the search type ('similarity' or 'mmr')
 * @returns A retriever object for querying the embedded documents
 */

export async function embedDocuments(
    chunks: Document[],
    k?: number,
    searchType?: "similarity" | "mmr",
) {
    // TODO: Options for different LLM models
    const embedding = new OpenAIEmbeddings()
    const VectorStore = await MemoryVectorStore.fromDocuments(
        chunks,
        embedding,
    )

    return VectorStore.asRetriever()
}

/**
 * Creates a document chain for summarizing and extracting key content from a given context.
 * @returns An object containing the document chain and format instructions
 */
export async function createDocumentChain(provider: LLMProvider) {

    let model;
    switch (provider) {
        case "openai":
            model = new ChatOpenAI({
                modelName: "gpt-4o",
                temperature: 0,
            });
            break;
        case "anthropic":
            model = new ChatAnthropic({
                model: 'claude-3-5-sonnet-20240620',
                temperature: 0,
            });
            break;
        default:
            throw new Error("Unsupported provider");
    }

    const outputSchema: z.ZodObject<any, any> = OUTPUT_SCHEMES("news")

    const parser = StructuredOutputParser.fromZodSchema(outputSchema)

    const chain = RunnableSequence.from([
        ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_MSG],
            ["assistant", ASSISTANT_MSG],
            [
                "user",
                "Please answer the following questions according to the provided context: \\n{question} \\n{context}",
            ],
        ]),
        model,
        parser,
    ])

    const formatInstructions = parser.getFormatInstructions()

    return { chain, formatInstructions }
}

export async function startLLMProcess(url: string, provider: LLMProvider, chunkSize: number = 1000, chunkOverlap: number = 200, k: number = 10, searchType: "similarity" | "mmr" = "similarity") {
    // Load the page
    const page = await loadUrl(url)
    const rawMarkdown = page.markdown
    const rawHtml = page.html

    // Preprocess the document
    const chunks = await splitDocument(rawHtml, rawMarkdown, chunkSize, chunkOverlap)
    const retriever = await embedDocuments(chunks, k, searchType)

    const { chain, formatInstructions } = await createDocumentChain(provider)

    const response = await chain.invoke({
        question: INITIAL_QUESTION,
        context: retriever,
        format_instructions: formatInstructions,
    })

    return response as LLMOutput
}

export async function getAnswerFromLLM(question: string, context: string, provider: LLMProvider): Promise<LLMOutput> {

    const { chain, formatInstructions } = await createDocumentChain(provider)

    const response = await chain.invoke({
        question: question,
        context: context,
        format_instructions: formatInstructions,
    })

    return response as LLMOutput

}

export function downloadResponse(
	content: string,
	fileName: string = 'json.txt',
	contentType: string = 'text/plain'
) {
	let a = document.createElement('a');
	let file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}
