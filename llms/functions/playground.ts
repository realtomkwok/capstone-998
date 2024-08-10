// Playground.ts
// This file is for testing and playing around with the API.
// It will be used to test the API and see how it works.

// Import libraries
import "dotenv/config"
import "@mendable/firecrawl-js"
import {FireCrawlLoader} from "@langchain/community/document_loaders/web/firecrawl";
import {MarkdownTextSplitter} from "@langchain/textsplitters"
import {OpenAIEmbeddings} from "@langchain/openai";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import {RunnableSequence} from "@langchain/core/runnables"
import {Document} from "@langchain/core/documents"
import {PromptTemplate} from "@langchain/core/prompts"
import {ChatOpenAI} from "@langchain/openai";
import {StringOutputParser} from "@langchain/core/output_parsers"
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";

// Type definitions
interface Data {
    siteUrl: string,
}

async function main(data: Data) {
    async function loadDoc(url: string) {
        // Load the document and retrieve the page content in Markdown format and metadata
        const loader = new FireCrawlLoader({
            url: url,
            apiKey: process.env.FIRECRAWL_API_KEY,
            mode: "scrape",
            params: {
                onlyMainContent: false,     // Only return the main content of the page, excluding the header, footer, etc.
                includeHTML: true,       // Include the HTML content of the page, this will add an `html` field to the response
                screenshot: true,     // Getting the screenshot of the top of the page that is being scraped
            }
        })

        const document = await loader.load()
        return {
            pageContent: document[0].pageContent,
            metadata: document[0].metadata
        }
    }

    async function splitChunks(content: string) {
        const splitter = new MarkdownTextSplitter({
            // TODO: Play with these params to optimize the split results
            chunkSize: 50,
            chunkOverlap: 20,
        })

        return await splitter.createDocuments([content])
    }

    async function embedDoc(chunks) {
        const embedding = new OpenAIEmbeddings()
        const vectorStore = await MemoryVectorStore.fromDocuments(chunks, embedding)

        // return vectorStore.asRetriever({k: 6, searchType: "similarity"})
        return vectorStore.asRetriever()
    }


    const convertDocsToString = (documents: Document[]): string => {
        return documents.map((document) => {
            return `<doc>\n${document.pageContent}\n</doc>`
        }).join("\n")
    }

    const llm = new ChatOpenAI({
        modelName: "gpt-4o-2024-08-06",
        temperature: 0
    })

    loadDoc(data.siteUrl).then((doc) => {
        splitChunks(doc.pageContent).then((splitDocs) => {
            embedDoc(splitDocs).then((retriever) => {

                const QUESTION = `Please analyze the provided website URL and perform the following tasks. Return the results in JSON format.
                1. Identify the website and its navigation: extract the website name, and list its main navigation items. If there are sub-menus, list them as well.
                2. Summarize the website's overall purpose and key contents under each navigation item.
                3. Suggest the next move for the user based on the provided content, ensuring the suggestion aligns with the website's main focus and the user's potential interests. This could be user's next action or question for you.
                `

                const TEMPLATE_STRING = `You are a helpful assistant helping visually impaired user to interpret and navigate the web. You will be given context of the webpage that the user is visiting, and answer their questions to the best of your ability using only the resources provided. Be verbose, concise, friendly in your response.

                <context> 
                {context} 
                </context>
                
                Please answer this question using the above context:
                {question}`

                const prompt = PromptTemplate.fromTemplate(TEMPLATE_STRING)

                const ragChain = createStuffDocumentsChain({
                    llm,
                    prompt: prompt,
                    outputParser: new StringOutputParser()
                })


            })
        })
    })
}

main({
    siteUrl: "https://www.abc.net.au/news"
}).finally(() => process.exit(0))