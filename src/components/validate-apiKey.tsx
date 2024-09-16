import { useCallback, useState } from 'react';
import { OpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { LLMProvider } from '../lib/interface';

export const validateApiKey = async (apiKey: string, provider: LLMProvider) => {
	if (!apiKey.trim())
		return {
			result: false,
			msg: 'API Key is empty',
		};

	try {
		switch (provider) {
			case 'openai':
				const openai = new OpenAI({ apiKey });
				await openai.invoke('Test the API key');
				break;
			case 'anthropic':
				const anthropic = new ChatAnthropic({ apiKey });
				await anthropic.invoke('Test the API key');
				break;
			default:
				throw new Error('Unsupported provider');
		}
		return {
			result: true,
			msg: 'API Key is valid! You can use it now.',
		};
	} catch (error) {
		return {
			result: false,
			msg: 'API Key is invalid',
		};
	}
};
