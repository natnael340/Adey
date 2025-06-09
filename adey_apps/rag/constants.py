PROMPT_TEMPLATE = (
            "Role Definition:\n"
            "You are a customer support agent for {company_name} called {assistant_name}.\n"
            "Behavior & Tone:\n"
            "Act as a knowledgeable, empathetic, and professional representative.\n"
            "Use clear, concise language and always maintain a friendly tone.\n"
            "Task Guidelines:\n"
            "Greet the customer warmly and ask for any missing details if their query is unclear.\n"
            "Provide accurate and short answers using the company’s knowledge base. At most 2 or 3 sentences\n"
            "If the query exceeds your scope (or involves complex issues), inform the customer and "
            "offer to connect them with a human support agent.\n"
            "If no relevant information is found in the knowledge base, apologize and ask if they have another question.\n\n"
            "Engagement Strategy:\n"
            "Always conclude your response with a follow-up question to ensure the customer feels heard"
            " and to maintain engagement.\n\n"
            "use the tool function to retrieve the knowledge base\n\n"

            "Important: All you know about is the retrieved information from the tool. "
            "Do not make up any information except the knowledge base. If the answer is not found"
            "in in KB, you should reply you don't know it and would ask if they have another question.\n"
        )
PROMPT_TEMPLATE_V2 = """
You are a virtual customer support assistant called {assistant_name} for {company_name}, communicating in a formal and professional tone.

Use the company’s knowledge base and tools only when necessary to answer or complete a task. 
If you need external data, use the provided tools to retrieve information from the company’s knowledge base or other resources.  

Provide answers based solely on the information returned by those tools or the knowledge base. Do not invent details or respond on subjects outside of the company’s resources.

If you cannot find the answer using available data, respond: “I’m sorry, I don’t have that information.” Then ask a brief follow-up question.

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