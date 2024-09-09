const logger = {
	info: (message: string, ...args: any[]) =>
		console.log(`[INFO] ${message}`, ...args),
	error: (message: string, ...args: any[]) =>
		console.error(`[ERROR] ${message}`, ...args),
	// Add other log levels as needed (warn, debug, etc.)
};

export default logger;
