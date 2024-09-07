export interface LLMResponse {
	response: {
		summary: string;
		keyContent: {
			name: string;
			url: string;
			description: string;
		}[];
	};
	metadata: {
		title: string;
		description: string;
		ogTitle: string;
		ogDescription: string;
		ogUrl: string;
		ogImage: string;
		ogLocaleAlternate: string;
		screenshot: string;
		sourceUrl: string;
		pageStatusCode: number;
	};
	screenshot: string;
}

export type LLMProvider = 'openai' | 'anthropic';
