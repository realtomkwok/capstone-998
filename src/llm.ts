import {
  loadUrl,
  createDocumentChain,
  embedDocuments,
  splitMarkdownDocument,
} from "./lib/helpers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

function getAnswerFromLLM(url: string) {
  loadUrl(url).then(async (document) => {
    splitMarkdownDocument(document.content, 32, 0)
      .then(async (chunks) => {
        embedDocuments(chunks)
          .then(async (retriever) => {
            createDocumentChain(retriever)
              .then(async (chain) => {
                const HUMAN_QUESTION = `Please analyze the provided website URL and perform the following tasks. Return the results in JSON format.
1. Identify the website and its navigation: extract the website name, and list its main navigation items. If there are sub-menus, list them as well.
2. Summarize the website's overall purpose and key contents under each navigation item.
3. Suggest the next move for the user based on the provided content, ensuring the suggestion aligns with the website's main focus and the user's potential interests. This could be user's next action or question for you.`;

                const answer = await chain.invoke(HUMAN_QUESTION);

                console.log(answer);
              })
              .catch((error) => {
                console.error(error);
              })
              .finally(() => {
                console.log("Documents have been embedded.");
              });
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            console.log("Document is split into chunks.");
          });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        console.log("URL has been loaded.");
      });
  });
}

getAnswerFromLLM("https://www.abc.net.au/news/");
