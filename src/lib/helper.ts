import { MarkdownTextSplitter } from '@langchain/textsplitters'
import { Document } from '@langchain/core/documents'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js'
import { z } from 'zod'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ASSISTANT_MSG, SYSTEM_MSG } from '@lib/prompts'
import { LLMProvider, LLMResponse } from '@lib/interface'

/**
 * Loads and scrapes the content of a given URL using FirecrawlApp.
 * @param url The URL to scrape
 * @returns An object containing the scraped content, metadata, and links on the page
 */

export async function loadUrl(url: string) {
    const crawlLoader: FirecrawlApp = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
    })
    
    const scrapeResponse: ScrapeResponse = await crawlLoader.scrapeUrl(url, {
        pageOptions: {
            includeHtml: true,
            replaceAllPathsWithAbsolutePaths: true,
            fullPageScreenshot: true,
            waitFor: 1000,
        },
    })
    
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
    }
}

/**
 * Splits the retrieved Markdown document into smaller chunks.
 * @param content The markdown content to split
 * @param chunkSize The size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @returns An array of Document objects representing the chunks
 */

export async function splitMarkdownDocument(
	content: string,
	chunkSize: number,
	chunkOverlap: number
) {
	// TODO: Try semantic chunking https://github.com/pinecone-io/examples/blob/master/learn/generation/better-rag/02b-semantic-chunking.ipynb

	const splitter = new MarkdownTextSplitter({
		chunkSize: chunkSize,
		chunkOverlap: chunkOverlap,
	});

	return splitter.createDocuments([content]);
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
	searchType?: 'similarity' | 'mmr'
) {
	// TODO: Options for different LLM models
	const embedding = new OpenAIEmbeddings();
	const VectorStore = await MemoryVectorStore.fromDocuments(
		chunks,
		embedding
	);

	return VectorStore.asRetriever();
}

/**
 * Creates a document chain for summarizing and extracting key content from a given context.
 * @returns An object containing the document chain and format instructions
 */
export async function createDocumentChain(provider: LLMProvider) {
    
    let model
    switch ( provider ) {
        case 'openai':
            model = new ChatOpenAI({
                modelName: 'gpt-3.5-turbo',
                temperature: 0,
            })
            break
        case 'anthropic':
            model = new ChatAnthropic({
                model: 'claude-3-5-sonnet-20240620',
                temperature: 0,
            })
            break
        default:
            throw new Error('Unsupported provider')
    }
    
    
    const outputSchema = z.object({
        summary: z.string().describe('Verbal summary of the website content'),
        keyContent: z.array(
          z.object({
              name: z.string().describe('Name of the item'),
              url: z.string().describe('Url of the item'),
              description: z.string().describe('Verbal description of the purpose of the item to guide user\'s next moves'),
          }),
        ),
    })
    
    const parser = StructuredOutputParser.fromZodSchema(outputSchema)
    
    const chain = RunnableSequence.from([
        ChatPromptTemplate.fromMessages([
            ['system', SYSTEM_MSG],
            ['assistant', ASSISTANT_MSG],
            [
                'user',
                'Please answer the following questions according to the provided context: \\n{question} \\n{context}',
            ],
        ]),
        model,
        parser,
    ])
    
    const formatInstructions = parser.getFormatInstructions()
    
    return { chain, formatInstructions }
}

export async function getAnswerFromLLM(
	url: string,
	provider: LLMProvider
): Promise<LLMResponse> {
	const document = await loadUrl(url);
	const markdown = document.markdown;
	const html = document.html;
	const metadata = document.metadata;
	const screenshot = metadata.screenshot;

	const question: string = `You are given a Markdown document that is transcribed from a raw HTML page, and you need to identify and tell what the user is visiting. For example, if you're given a news website, you should summarize a few pieces of top news in short sentences, and suggest user's next moves. Here is an example of the expected response:
1. "The top news stories including [News 1 summarized in a concise sentence], [News 2], [News 3], [News 4]." (Identify and summarize)
2. "If you're interested in [Topic 1], you can visit [Topic] section, ask me for more information!" (Suggest next moves)`;

	const { chain, formatInstructions } = await createDocumentChain(provider);

	const response = await chain.invoke({
		context: markdown,
		question: question,
		format_instructions: formatInstructions,
	});

	return { response, metadata, screenshot };
}

export function downloadResponse(
  content: string,
  fileName: string    = 'json.txt',
  contentType: string = 'text/plain'
) {
    let a = document.createElement('a');
    let fi,le = new Blob([content], { type: contentType});
    a.href = URL.createObjectURL(file);
    a.download= fileName;
    a.click();
}