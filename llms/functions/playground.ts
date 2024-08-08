// Playground.ts
// This file is for testing and playing around with the API.
// It will be used to test the API and see how it works.

// Import libraries
import "@mendable/firecrawl-js"
import {FireCrawlLoader} from '@langchain/community/document_loaders/web/firecrawl';

// Read environment variables
require('dotenv').config()

// const langChainApiKey = process.env.LANGCHAIN_API_KEY
// const openAIApiKey = process.env.OPENAI_API_KEY
// const fireCrawlApiKey = process.env.FIRECRAWL_API_KEY

const siteUrl: string = "https://www.abc.net.au/news"

// Construct the loader for
const loader = new FireCrawlLoader({
    url: siteUrl,
    apiKey: process.env.FIRECRAWL_API_KEY,
    mode: "scrape",
    // params: {}
})

function main() {
    // Load the document
    loader.load().then((doc) => {
        console.log(doc[0])
    })
}

main()