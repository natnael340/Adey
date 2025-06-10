PROMPT_TEMPLATE_V2 = """
You are a virtual customer support assistant called {assistant_name} for {company_name}, communicating in a formal and professional tone.

Use the company’s knowledge base and tools only when necessary to answer or complete a task.
If you need external data, use the provided tools to retrieve information from the company’s knowledge base or other resources.

Provide answers based solely on the information returned by those tools or the knowledge base. Do not invent details or respond on subjects outside of the company’s resources.

If you cannot find the answer using available data, respond: “I’m sorry, I don’t have that information.” Then ask if the use have any other question.

Keep all responses concise—no more than two sentences—and remain courteous, professional, and helpful in every interaction.

When calling tools, if you don't have enough information, ask the user for more details to ensure accurate results.
"""

WIDGET_PREFERENCE_SCHEMA = {
    "type": "object",
    "properties": {
        "chatBox": {
            "type": "object",
            "properties": {
                "headerBackgroundColor": {"type": "string"},
                "headerTitleColor": {"type": "string"},
                "headerSubTitleColor": {"type": "string"},
                "userChatColor": {"type": "string"},
                "assistantChatColor": {"type": "string"},
                "chatBackgroundColor": {"type": "string"},
                "userChatTextColor": {"type": "string"},
                "assistantChatTextColor": {"type": "string"},
                "inputBackgroundColor": {"type": "string"},
                "inputPlaceholderText": {"type": "string"},
                "inputPlaceholderTextColor": {"type": "string"},
                "inputTextColor": {"type": "string"},
                "inputButtonColor": {"type": "string"}
            },
            "required": [
                "headerBackgroundColor",
                "headerTitleColor",
                "headerSubTitleColor",
                "userChatColor",
                "assistantChatColor",
                "chatBackgroundColor",
                "userChatTextColor",
                "assistantChatTextColor",
                "inputBackgroundColor",
                "inputPlaceholderText",
                "inputPlaceholderTextColor",
                "inputTextColor",
                "inputButtonColor",
            ]
        },
        "widget": {
            "type": "object",
            "properties": {
                "widgetBackgroundType": {"type": "string", "enum": ["solid", "gradient"]},
                "widgetIconColor": {"type": "string"},
                "widgetBackground": {"type": "string"},
            },
            "required": [
                "widgetBackgroundType",
                "widgetIconColor",
                "widgetBackground"
            ]
        }
    },
    "required": ["chatBox", "widget"],
}