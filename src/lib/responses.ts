export const RESPONSES = {
	couldNotUnderstand: {
		message:
			"I couldn't understand the question. Would you like to try again?",
		sound: '/public/sounds/interstitial-delay-tone.wav',
	},
	noAnswerFound: {
		message:
			"Sorry, I couldn't find an answer for that. Would you like me to try again?",
		sound: '/public/sounds/attending-window-end.wav',
	},
	error: {
		message: 'Error processing your request. Please try again.',
		sound: '/public/sounds/attending-window-end.wav',
	},
	success: {
		message: 'Success',
		sound: '/public/sounds/cheers.wav',
	},
};