
WIDGET_PREFERENCE_SCHEMA = {
    "type": "object",
    "properties": {
        "chatBox": {
            "type": "object",
            "properties": {
                "headerBackgroundColor": {"type": "string"},
                "headerTitleColor": {"type": "string"},
                "userChatColor": {"type": "string"},
                "assistantChatColor": {"type": "string"},
                "chatBackgroundColor": {"type": "string"},
                "userChatTextColor": {"type": "string"},
                "assistantChatTextColor": {"type": "string"},
                "inputBackgroundColor": {"type": "string"},
                "inputPlaceholderText": {"type": "string"},
                "inputPlaceholderTextColor": {"type": "string"},
                "inputTextColor": {"type": "string"},
            },
            "required": [
                "headerBackgroundColor",
                "headerTitleColor",
                "userChatColor",
                "assistantChatColor",
                "chatBackgroundColor",
                "userChatTextColor",
                "assistantChatTextColor",
                "inputBackgroundColor",
                "inputPlaceholderText",
                "inputPlaceholderTextColor",
                "inputTextColor"
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