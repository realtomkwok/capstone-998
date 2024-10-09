import z from 'zod';
import { ASSISTANT_MSG } from './prompts';

export const OUTPUT_SCHEMES = () => {
	const pageLayout = z.object({
		description: z
			.string()
			.describe(
				'A concise description of the page layout and content structure'
			),
		sections: z
			.array(
				z.object({
					name: z
						.string()
						.describe('The title or headline of the section'),
					description: z
						.string()
						.describe(
							'A brief description of the content within the section'
						),
				})
			)
			.describe(
				'An array of sections within the page, each with a name and description'
			),
	});

	const navigation = z
		.array(
			z.object({
				name: z
					.string()
					.describe(
						'The title or headline of the navigation section'
					),
				description: z
					.string()
					.describe(
						'A brief description of the content within the navigation section'
					),
				url: z.string().describe('The URL of the navigation item'),
			})
		)
		.describe(
			'An array of navigation items within the page, each with a name, description, and URL'
		);

	const topStories = z.array(
		z.object({
			title: z
				.string()
				.describe('A verbal, concise headline of the top story'),
			ogTitle: z
				.string()
				.describe(
					'The original title of the top story, as it appears on the source website'
				),
			description: z
				.string()
				.describe('A verbal, concise description of the top story'),
			url: z.string().describe('The URL of the top story'),
		})
	);

	const answer = z
		.string()
		.describe(
			`A verbal, concise answer to the user\'s question. If the user is not asking a question, summarize the page and follow the examples I gave you: ${ASSISTANT_MSG}`
		);

	return z.object({
		answer: answer,
				pageLayout: pageLayout,
				navigation: navigation,
				topStories: topStories,
	});
};
