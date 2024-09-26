import { useCallback, useState } from 'react';
import { OpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { LLMProvider } from '../lib/interface';

export const validateApiKey = async (apiKey: string, provider: LLMProvider) => {
	if (!apiKey.trim())
		return {
			isValid: false,
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
		}
		return {
			isValid: true,
			msg: 'API Key is valid! You can use it now.',
		};
	} catch (error) {
		return {
			isValid: false,
			msg: 'API Key is invalid',
		};
	}
};
