export interface LLMResponse {
	answer: string;
	pageLayout?: {
		name: string;
		description: string;
		url: string;
	}[];
	navigation?: {
		name: string;
		description: string;
		url: string;
	}[];
	topStories?: {
		title: string;
		ogTitle: string;
		description: string;
		url: string;
	}[];
}

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMChat {
	id: string | undefined
	input: string | undefined | never
	output: LLMResponse | undefined | never
}

export interface ScrapePageData {
	content: string;
	markdown: string;
	html: string;
	linksOnPage: string[];
	metadata: {
		title: string;
		description: string;
		ogTitle: string;
		ogDescription: string;
		ogImage: string;
		ogUrl: string;
		ogLocaleAlternate: string;
		sourceURL: string;
		statusCode: number;
	};
	screenshot: string;
}

export interface MsgBackgroundToSidepanel {
	type: 'GET_URL' | 'URL_RECEIVED' | 'UPDATE_URL' | 'UPDATE_RESPONSE' | 'SIDEPANEL_READY';
	url?: string;
	response?: LLMResponse;
}

export interface FontVariationSettings {
	'FILL': 1 | 0;
	'wght': 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	'GRAD': -25 | 0 | 200;
	'opsz': 20 | 24 | 40 | 48;
}

export interface MaterialSymbolProps {
	symbol: string;
	fill: boolean
	weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
	grade: -25 | 0 | 200;
	opticalSize: 20 | 24 | 40 | 48;
}