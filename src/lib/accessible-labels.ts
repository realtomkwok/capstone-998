const TOP_APP_BAR = {
    "ariaLabel": "Toolbar",
    "ariaDescription": "Press Tab to start using Clara."
}

const SETTINGS_BUTTON = {
    "ariaLabel": "Preferences",
    "ariaDescription": "Press Enter to change Clara's language, voice, and API settings."
}

const PREFERENCES_DRAWER = {
    "role": "dialog",
    "ariaLabel": "Preferences",
    "ariaLabelledBy": "settings-title",
    "ariaDescription": "To change Clara's preferences, press Tab to focus on the preferences, and use Enter/Space to select."
}

const LLM_PROVIDERS = { 
    "ariaLabel": "LLM Providers",
    "ariaDescription": "Select the LLM provider. Available for OpenAI and Anthropic. Different providers may have different response quality and cost."
}

const SPEECH = {
    "ariaLabel": "Speech",
    "ariaDescription": "Select the speech language, voice, and speed."
}

export { TOP_APP_BAR, SETTINGS_BUTTON, PREFERENCES_DRAWER, LLM_PROVIDERS };
