# LLMs

LLMs (Large Language Models) are a cornerstone of Clara, which is used to analyze and interpret website data retrieved
from the user's client (browser). This wiki page will cover which LLMs are used in Clara, how they are used - such as
what prompts are used, and how they are compared to each other in terms of performance, usability, and other metrics.

- [Models](#models)
- [User Flow & Prompts](#user-flows--prompts)
- [Review & Comparison](#reviews--comparison)
- [References](#references)

## Models

| Model Name and Version                                                   | Provider      | Size (Params)    | Modalities | Context Length | Cost (Input/Output per 1M tokens)                            | Note               | Strength                                                                                         |
|--------------------------------------------------------------------------|---------------|------------------|------------|----------------|--------------------------------------------------------------|--------------------|--------------------------------------------------------------------------------------------------|
| [GPT-4o/4o mini](https://platform.openai.com/docs/overview)              | OpenAI        | N/A              | Yes        | 128K           | **GPT-4o:** $5/$15<br />**mini:** $0.15/0.60                 |                    | **4o:** the currently best-performing model<br />**4o mini:** same capacities with a lower price |
| [Gemini 1.5 Pro/Flash](https://ai.google.dev/gemini-api/docs)            | Google        | N/A              | Yes        |                | [A bloody weird pricing plan](https://ai.google.dev/pricing) |                    |                                                                                                  |
| [Claude 3.5 Sonnet/ 3 Haiku](https://docs.anthropic.com/en/docs/welcome) | Anthropic     | N/A              | Yes        | 200K           | **3.5 Sonnet:** $3.00/$15.00<br />**3 Haiku:** $0.25/$1.25   |                    | Pretty much the same as GPT                                                                      |
| [Llama 3.1](https://llama.meta.com/docs/overview)                        | Meta          | 8B/70B/405B      | Yes        |                |                                                              | Run on HuggingFace | Open source                                                                                      |
| [Qwen2](https://huggingface.co/Qwen)                                     | Alibaba Cloud | 1.5B/7B/57B-A14B |            |                |                                                              | Run on HuggingFace | Open source                                                                                      |

## User Flows & Prompts

### Scenario 1: User opens a new webpage

#### Description #### 

The user opens a new webpage (e.g. ABC news) and wants to know the latest news. The site is being loaded and Clara is
running in the background.

#### What user needs (What a visually enabled user perceives) ####

* A summary of the webpage content (e.g "This is a news website")
* Action suggestions (e.g. "Would you like to read the latest news?")
* ...

#### Prompts ####

```text
```

## Reviews & Comparison

### Criteria

* How long does it take to get a response?
* How accurate is the response?
* How much does it cost?
* How easy is it to use, especially to visually impaired users.

## References