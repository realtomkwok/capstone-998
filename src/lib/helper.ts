import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
	DESCRIPTION_INSTRUCTIONS,
	SUMMARY_INSTRUCTIONS,
	SYSTEM_MSG, USER_MSG,
} from './prompts';

export async function loadUrl(url: string) {
	const crawlLoader: FirecrawlApp = new FirecrawlApp({
		apiKey: process.env.FIRECRAWL_API_KEY,
	});

	const scrapeResponse: ScrapeResponse = await crawlLoader.scrapeUrl(url, {
		pageOptions: {
			includeHtml: true,
			replaceAllPathsWithAbsolutePaths: true,
			fullPageScreenshot: true,
			waitFor: 1000,
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
	searchType?: 'similarity' | 'mmr',
) {
	// TODO: Options for different LLM models
	const embedding = new OpenAIEmbeddings();
	const VectorStore = await MemoryVectorStore.fromDocuments(chunks, embedding);

	return VectorStore.asRetriever();
}

export async function createDocumentChain() {
	const model = new ChatOpenAI({
		apiKey: process.env.OPENAI_API_KEY,
		model: 'gpt-4o-mini',
		temperature: 0,
	});

	const outputSchema = z.object({
		summary: z.string().describe(SUMMARY_INSTRUCTIONS),
		keyContent: z.array(
			z.object({
				name: z.string().describe('Name of the item'),
				url: z.string().describe('Url of the item'),
				description: z.string().describe(DESCRIPTION_INSTRUCTIONS),
			}),
		),
	});

	const parser = StructuredOutputParser.fromZodSchema(outputSchema);

	const chain = RunnableSequence.from([
		ChatPromptTemplate.fromMessages([
			[
				'system',
				SYSTEM_MSG,
			],
			['assistant', '{format_instructions}'],
			[
				'user',
				'Please answer the following questions according to the provided context: \\n{question} \\n{context}',
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
		question: USER_MSG,
		format_instructions: formatInstructions,
	});

	return { response, metadata, screenshot };
}

