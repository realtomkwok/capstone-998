# Clara - Web Navigation Assistant

Clara is a Chrome extension designed to enhance web navigation by providing AI-powered insights and assistance.

## Usage

1. Download the release ZIP file from the [Releases](https://github.com/realtomkwok/capstone-998/releases) page.
2. Unzip the file on your computer.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Drag and drop the unzipped folder into the extensions page.
5. And you're ready to use Clara!

OR manually load the extension:

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" and select the `build` directory created in the build step.

## Development

- Use `npm run watch` for development with hot-reloading.
- Run `npm run format` to format code using Prettier.

### Building the Extension

1. Ensure you have Node.js and npm installed.
2. Clone the repository and navigate to the project directory.
3. Install dependencies:
    ```shell
    npm install
    ```
4. Build the production extension:
    ```shell
   npm run build
    ```

This will create a `build` directory with the compiled extension.

## Packaging

To create a ZIP file for distribution:

```shell
npm run pack
```

To rebuild and repack:

```shell
npm run rebuild
```

## Technologies Used

### Frontend

- React: A JavaScript library for building user interfaces.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- Tailwind CSS: A utility-first CSS framework for styling.
- Node.js and npm: Used for development and package management.

### Context Processing

- LangChain: An AI framework for calling LLMs and monitoring their performance.
- Open AI: API for calling the GPT-4 model.
- Anthropic: API for calling the Claude-3.5 Sonnet model.
- FireCrawl: A web scraping tool used to load and process web page content.

### Voice Synthesis

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

