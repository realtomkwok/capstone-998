import {
    MarkdownTextSplitter,
    RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents"
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { ChatAnthropic } from "@langchain/anthropic"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js"
import { z } from "zod"
import { StructuredOutputParser } from "langchain/output_parsers"
import { RunnableSequence } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ASSISTANT_MSG, INIT_PROMPT, SYSTEM_MSG, USER_MSG } from "@lib/prompts"
import { LLMProvider, ScrapePageData, LLMResponse } from "@lib/interface"
import { OUTPUT_SCHEMES } from "./response-format"

/**
 * Loads and scrapes the content of a given URL using FirecrawlApp.
 * @param url The URL to scrape
 * @returns An object containing the scraped content, metadata, and links on the page
 */

export async function loadUrl(url: string): Promise<ScrapePageData> {
    // TODO: Use another webpage loader if FirecrawlApp is not available: https://js.langchain.com/v0.1/docs/integrations/document_loaders/web_loaders/web_playwright/
    
    // Log the URL being loaded
    console.log(`Starting to load URL: ${url}`)
    
    const crawlLoader: FirecrawlApp = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
    })
    
    try {
        const scrapeResponse: ScrapeResponse = await crawlLoader
            .scrapeUrl(url, {
                pageOptions: {
                    includeHtml: true,
                    replaceAllPathsWithAbsolutePaths: true,
                    fullPageScreenshot: true,
                    waitFor: 500,
                },
            })
            .catch((error) => {
                console.error(error)
                throw error
            })
        
        console.log(`URL loaded: ${url}`)
        console.log(scrapeResponse.data)
        
        return {
            content: scrapeResponse.data.content,
            markdown: scrapeResponse.data.markdown,
            html: scrapeResponse.data.html,
            linksOnPage: scrapeResponse.data.linksOnPage,
            metadata: scrapeResponse.data.metadata,
            screenshot: scrapeResponse.data.screenshot,
        }
        
    } catch (error) {
        console.error(`Error loading URL: ${url}`, error)
        throw error
    }
}

/**
 * Splits the retrieved Markdown document into smaller chunks.
 * @param rawHtml The raw HTML content of the document
 * @param rawMarkdown The raw Markdown content of the document
 * @param chunkSize The size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @returns An array of Document objects representing the chunks
 */

export async function splitDocument(
    rawHtml: string,
    rawMarkdown: string,
    chunkSize: number,
    chunkOverlap: number,
) {
    try {
        console.log("Starting document splitting process")
        
        const htmlSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: chunkSize,
            chunkOverlap: chunkOverlap,
        })
        
        const markdownSplitter = new MarkdownTextSplitter({
            chunkSize: chunkSize,
            chunkOverlap: chunkOverlap,
        })
        
        console.log("Splitting HTML document")
        const htmlDocuments = await htmlSplitter.createDocuments([rawHtml])
        console.log(`HTML document split into ${htmlDocuments.length} chunks`)
        
        console.log("Splitting Markdown document")
        const markdownDocuments = await markdownSplitter.createDocuments([
            rawMarkdown,
        ])
        console.log(`Markdown document split into ${markdownDocuments.length} chunks`)
        
        const combinedDocuments = [...htmlDocuments, ...markdownDocuments]
        console.log(`Total chunks created: ${combinedDocuments.length}`)
        
        return combinedDocuments
    } catch (error) {
        console.error("Error in splitDocument function:", error)
        throw new Error("Failed to split document: " + error)
    }
}

/**
 * Embeds documents into a vector store for efficient retrieval.
 * @param chunks An array of Document objects to embed
 * @returns A retriever object for querying the embedded documents
 */

export async function embedDocuments(
    chunks: Document[],
) {
    try {
        console.log("Starting document embedding process")
        const embedding = new OpenAIEmbeddings({openAIApiKey: process.env.OPENAI_API_KEY})
        console.log("Created OpenAIEmbeddings instance")
        
        const VectorStore = await MemoryVectorStore.fromDocuments(
            chunks,
            embedding,
        )
        console.log(`Successfully embedded ${chunks.length} documents into MemoryVectorStore`)
        
        const retriever = VectorStore.asRetriever()
        console.log("Created retriever from VectorStore")
        
        return retriever
    } catch (error) {
        console.error("Error in embedDocuments function:", error)
        throw new Error("Failed to embed documents: " + error)
    }
}

/**
 * Creates a document chain for summarizing and extracting key content from a given context.
 * @param provider The language model provider to use: Open AI or Anthropic Claude
 * @returns An object containing the document chain and format instructions for the structured output
 */
export async function createDocumentChain(
	provider: LLMProvider,
) {
	try {
		console.log(`Creating document chain for provider: ${provider}`);
		let model;
		switch (provider) {
			case 'openai':
				console.log('Initializing OpenAI model');
				model = new ChatOpenAI({
					modelName: 'gpt-4o-mini',
					temperature: 0,
            apiKey: process.env.OPENAI_API_KEY,
				});
				break;
			case 'anthropic':
				console.log('Initializing Anthropic model');
				model = new ChatAnthropic({
					model: 'claude-3-5-sonnet-20240620',
					temperature: 0,
            apiKey: process.env.ANTHROPIC_API_KEY,
				});
				break;
		}

		const outputSchema: z.ZodObject<any, any> = OUTPUT_SCHEMES('news');
		console.log('Output schema:', outputSchema);

		const parser = StructuredOutputParser.fromZodSchema(outputSchema);

		console.log('Creating runnable sequence');
		const chain = RunnableSequence.from([
			ChatPromptTemplate.fromMessages([
				['system', SYSTEM_MSG],
				['assistant', ASSISTANT_MSG],
				['user', USER_MSG],
			]),
			model,
			parser,
		]);

		const formatInstructions = parser.getFormatInstructions();
		console.log('Format instructions:', formatInstructions);

		console.log('Document chain created successfully');
		return { chain, formatInstructions };
	} catch (error) {
		console.error('Error in createDocumentChain function:', error);
		throw new Error(`Failed to create document chain: ${error}`);
	}
}

/**
 * Starts the LLM pipeline process by loading a URL, splitting the document, embedding the chunks, and creating a document chain. Intended for background processing when the user visits a page.
 * @param url The URL to load and process
 * @param provider The language model provider to use. Default is OpenAI. Supported providers: 'openai', 'anthropic'
 * @param chunkSize The size of each chunk
 * @param chunkOverlap The overlap between chunks
 * @return The response from the LLM pipeline
 */

export async function startLLM(
    url: string,
    provider: LLMProvider,
    chunkSize: number    = 1000,
    chunkOverlap: number = 200,
): Promise<LLMResponse> {
    try {
        // Play a sound to indicate that the LLM process has started
        console.log(`Starting LLM process for URL: ${url}`)
        
        // Load the page
        const page = await loadUrl(url)
        console.log("Page loaded successfully")
        const rawMarkdown = page.markdown
        // const rawHtml = page.html
        
        // // Preprocess the document
        // console.log("Preprocessing document...")
        // const chunks = await splitDocument(
        //     rawHtml,
        //     rawMarkdown,
        //     chunkSize,
        //     chunkOverlap,
        // )
        // console.log(`Document split into ${chunks.length} chunks`)
        //
        // const retriever = await embedDocuments(chunks)
        // console.log(`Document chunks: ${chunks.length} embedded into retriever`)
        
        const { chain, formatInstructions } = await createDocumentChain(provider)
        console.log("Document chain created")
        
        console.log("Invoking chain...")
        const response = await chain.invoke({
            context: rawMarkdown,
            question: '',
            format_instructions: formatInstructions,
        })
        console.log("Chain invoked successfully")
        console.log("LLM Response:", response)
        
        return response as LLMResponse
        
    } catch (error) {
        console.error("Error in startLLMProcess:", error)
        throw new Error(`Failed to process LLM request: ${error}`)
    } finally {
        if (typeof window !== 'undefined' && window.Audio) {
            new Audio('/public/sounds/cheers.wav').play()
            .catch(error => console.error('Error playing sound:', error))
        }
    }
}

// TODO: Implement the following-up context function
// export async function getAnswerFromLLM(input: string, provider: LLMProvider) {
//     const urlPattern = new RegExp(
//         "^(https?|ftp)://[a-zA-Z0-9-.]+.[a-zA-Z]{2,}(:[0-9]{2,})?(/.*)?$",
//     )
// }

/**
 * Reads out the given text using the browser's speech synthesis API.
 * @param text The text to read
 * @param language The language to use for speech synthesis
 * @param pitch The pitch of the voice
 * @param rate The rate of speech
 * TODO: Try another TTS engine if the browser's API is not available
 */

export function readText(text: string, language: string = "en-US", rate: number = 1, speechVoice: SpeechSynthesisVoice) {
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = language  // Set the language as needed
    // speech.pitch = pitch    // Set the pitch
    speech.rate = rate      // Set the rate
    speech.voice = speechVoice
    window.speechSynthesis.speak(speech)
}


export function downloadResponse(
    content: string,
    fileName: string,
    contentType: string
) {
    let a = document.createElement("a")
    let file = new Blob([content], { type: contentType })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
}