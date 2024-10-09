import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import {
	RunnableSequence,
} from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ASSISTANT_MSG, SYSTEM_MSG, USER_MSG } from '@lib/prompts';
import {
	ScrapePageData,
	LLMResponse,
	SpeechLanguage,
} from '@lib/interface';
import { OUTPUT_SCHEMES } from './response-format';
import { getStorage } from '@lib/storage';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Client } from 'langsmith';

/**
 * Loads and scrapes the content of a given URL using FirecrawlApp.
 * @param url The URL to scrape
 * @returns An object containing the scraped content, metadata, and links on the page
 */

export async function loadUrl(url: string): Promise<ScrapePageData> {
	// TODO: Use another webpage loader if FirecrawlApp is not available: https://js.langchain.com/v0.1/docs/integrations/document_loaders/web_loaders/web_playwright/

	// Log the URL being loaded
	console.log(`Starting to load URL: ${url}`);

	const crawlLoader: FirecrawlApp = new FirecrawlApp({
		apiKey: process.env.FIRECRAWL_API_KEY,
	});

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
				throw error;
			});

		return {
			content: scrapeResponse.data.content,
			markdown: scrapeResponse.data.markdown,
			html: scrapeResponse.data.html,
			linksOnPage: scrapeResponse.data.linksOnPage,
			metadata: scrapeResponse.data.metadata,
			screenshot: scrapeResponse.data.screenshot,
		};
	} catch (error) {
		throw error;
	}
}

/**
 * Starts the scraping process by loading a URL and caching the result. Intended for background processing when the user visits a page.
 * @param url The URL to load and scrape
 * @returns An object containing the scraped content, metadata, and links on the page
 */

export async function startScrapePage(url: string): Promise<ScrapePageData> {
	const storage = getStorage();
	const cachedPageKey = `scraped-page-${url}`;
	const CACHE_EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours in milliseconds

	const cachedPage = await storage.getItem(cachedPageKey);
	if (
		cachedPage?.timestamp &&
		Date.now() - cachedPage.timestamp < CACHE_EXPIRATION
	) {
		return cachedPage.data;
	} else {
		const page = await loadUrl(url);
		await storage.setItem(cachedPageKey, {
			data: page,
			timestamp: Date.now(),
		});
		return page;
	}
}
/**
 * Starts the LLM pipeline process by loading a URL, splitting the document, embedding the chunks, and creating a document chain. Intended for background processing when the user visits a page.
 * @param url The URL to load and process
 * @param question The user's question
 * @return The response from the LLM pipeline
 */

export async function startLLM(url: string, question: string): Promise<LLMResponse> {
	// TODO: Play a sound to indicate that the LLM process has started
	const storage = getStorage();
	const llmProvider = (await storage.getItem('llmProvider')) || 'openai';
	const apiKey = (await storage.getItem('apiKey')) as string;
	
	const callback = [
			new LangChainTracer({
					projectName: process.env.LANGCHAIN_PROJECT,
					client: new Client({ apiUrl: process.env.LANGCHAIN_ENDPOINT, apiKey: process.env.LANGCHAIN_API_KEY }),
			})
	]

	const model =
		llmProvider === 'openai'
			? new ChatOpenAI({ modelName: 'gpt-4o-mini', apiKey: apiKey || process.env.OPENAI_API_KEY })
			: new ChatAnthropic({ model: 'claude-3-5-sonnet-20240620', apiKey: apiKey || process.env.ANTHROPIC_API_KEY });

	const outputSchema = OUTPUT_SCHEMES();
	const outputParser = StructuredOutputParser.fromZodSchema(outputSchema);

	// TODO: Add parallel processing for summarization and key content extraction
	return startScrapePage(url).then(async (page) => {

		const prompt = ChatPromptTemplate.fromMessages([
			["system", SYSTEM_MSG],
			["assistant", ASSISTANT_MSG],
			["user", USER_MSG],
		]);

		const chain = RunnableSequence.from([prompt, model, outputParser]);
		
		const response = await chain.invoke(
			{
				context: page.markdown,
				question: question,
				format_instructions: outputParser.getFormatInstructions(),
			},
			{ callbacks: callback}
		);

		return response as LLMResponse;
	});
}

// TODO: Implement the following-up context function

/**
 * Reads out the given text using the browser's speech synthesis API.
 * @param text The text to read
 * @todo Try another TTS engine if the browser's API is not available
 */

export async function readText(text: string) {
	const storage = getStorage();

	const speech = new SpeechSynthesisUtterance(text);

	try {
		const language = (await storage.getItem(
			'speechLanguage'
		)) as SpeechLanguage;
		const rate = (await storage.getItem('speechRate')) as number;
		const voice = (await storage.getItem(
			'speechVoice'
		)) as SpeechSynthesisVoice;

		console.log(
			`Retrieved speech settings: language: ${language}, rate: ${rate}, voice: ${voice}`
		);

		speech.lang = language;
		speech.rate = rate;
		speech.voice = voice;

		speechSynthesis.speak(speech);
	} catch (error) {
		console.error('Error retrieving speech settings:', error);
		// Fallback to default settings if there's an error
		speechSynthesis.speak(speech);
	}
}

export function downloadResponse(
	content: string,
	fileName: string,
	contentType: string
) {
	let a = document.createElement('a');
	let file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

export const urlPattern = new RegExp(
	'^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$',
	'i'
);

export const clearProcessedUrls = () => {
	// Clear processedUrls from chrome.storage.local
	chrome.storage.local.remove('processedUrls', () => {
		console.log('Cleared processedUrls from chrome.storage.local');
	});

	console.log('Cache cleared');
	console.log(localStorage.getItem('processedUrls'));
};

export const clearCachedPage = (url: string) => {
	localStorage.removeItem(`scraped-page-${url}`);
	console.log(`Cleared cached page for ${url}`);
};

export const clearCachedResponse = (url: string) => {
	localStorage.removeItem(`llm-response-${url}`);
	console.log(`Cleared cached response for ${url}`);
};
