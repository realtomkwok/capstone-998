## User flow

```
// Clara receives the metadata (e.g. MHTML files) of the webpage.
// Clara sends the metadata to the LLM with the following prompt:
Clara: "Please summarize this website. If is (conditions)... And suggest actions for the me."
LLM: "This is a news website. The latest news is about the war in Ukraine. Would you like to read the latest news?"
// Clara feedbacks the user with the LLM response.
// Waiting for user's interaction.
```