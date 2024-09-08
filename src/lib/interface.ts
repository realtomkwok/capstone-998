export interface LLMOutput {
	response: {
		answer: string;
		pageLayout: {
			name: string;
			description: string;
			url: string;
		}[];
		navigation: {
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

export interface LLMChat {
	id: string | undefined;;
	input: string | undefined | never;;
	output: LLMOutput | undefined | never;;
}