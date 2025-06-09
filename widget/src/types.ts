export type ProfileType = {
  assistant_name: string;
  assistant_role: string;
  assistant_pic?: string;
};

export type MessageType = {
  message: string;
  message_type: string;
  seen: boolean;
};

export type PreferenceType = {
  chatBox: {
    headerBackgroundColor: string;
    headerTitleColor: string;
    headerSubTitleColor: string;
    userChatColor: string;
    assistantChatColor: string;
    chatBackgroundColor: string;
    userChatTextColor: string;
    assistantChatTextColor: string;
    inputBackgroundColor: string;
    inputPlaceholderText: string;
    inputPlaceholderTextColor: string;
    inputTextColor: string;
    inputButtonColor: string;
  };
  widget: {
    widgetBackgroundType: "solid" | "gradient";
    widgetIconColor: string;
    widgetBackground: string;
  };
};

export type ThemeType = {
  identifier: string;
  name: string;
  preferences: PreferenceType;
};
