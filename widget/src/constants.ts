import { PreferenceType } from "./types";

export const HUMAN = "HUMAN";
export const AI = "AI";

export const DEFAULT_CONFIG: PreferenceType = {
  chatBox: {
    headerBackgroundColor: "#EDD447",
    headerTitleColor: "#363636",
    headerSubTitleColor: "#959595",
    userChatColor: "#EDD447",
    assistantChatColor: "#D3D3D3",
    chatBackgroundColor: "#F8F9FC",
    userChatTextColor: "#363636",
    assistantChatTextColor: "#363636",
    inputBackgroundColor: "#FFFFFF",
    inputPlaceholderText: "Type your question",
    inputPlaceholderTextColor: "#959595",
    inputTextColor: "#363636",
    inputButtonColor: "#FFA751",
  },
  widget: {
    widgetIconColor: "#fff",
    widgetBackgroundType: "gradient",
    widgetBackground: "linear-gradient(to bottom, #FFA751, #FFE259)",
  },
  //widgetBackgroundColor: "#FFA751",
};
