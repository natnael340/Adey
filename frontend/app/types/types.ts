import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { ImageProps } from "next/image";

export type ChatType = {
  identifier: string;
  name: string;
  slug: string;
  assistant_name: string;
  assistant_role: string;
  business_description: string;
  business_name: string;
  assistant_characters: {
    name: string;
  }[];
  assistant_picture_url: string;
  resources: number;
  conversations: number;
  allowed_urls: string[] | [];
  status: string;
};

export type ChatDetailType = {
  identifier: string;
  name: string;
  slug: string;
  assistant_name: string;
  business_description: string;
};

export type ChatFormType = {
  name: string;
  assistant_picture_data: string | null;
  assistant_name: string;
  assistant_characters: string[];
  assistant_role: string;
  business_name: string;
  business_description: string;
  allowed_urls: string[];
};

export type ResourceFormType = {
  name: string;
  document: string | File;
};

export type ResourceType = {
  name: string;
  slug: string;
  document: string;
  document_type: string;
};
export type ResourceDataTypeWithPagination = {
  count: number;
  next: null | string;
  prev: null | string;
  results: ResourceType[];
};

export type RegisterFormType = {
  email: string;
  password: string;
  confirm_password: string;
};

export interface AuthenticatedUser extends User {
  accessToken?: string;
  refreshToken?: string;
}

export type AuthenticationResponseType = {
  access: string;
  refresh: string;
};

export interface AuthenticatedUserToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthenticatedUserSession extends Session {
  accessToken?: string;
}

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
export type DashboardMessageType = {
  date: string;
  count: number;
};

export type DashboardChatBotType = {
  name: string;
  message_count: number;
  message_data: DashboardMessageType[];
  user_session_count: number;
};

export type UserPlanType = {
  name: string;
  period: string;
  max_chatbot: number;
  max_webapp_per_bot: number;
  max_request_per_month: number;
  max_user_session: number;
  price: string;
};

export type DashboardDataType = {
  user_plan: UserPlanType;
  total_messages_count: number;
  total_chats_count: number;
  total_chat_bots_count: number;
  total_sessions_count: number;
  message_statistics: DashboardMessageType[];
  chat_statistics: DashboardChatBotType[];
};

export type PlanResponseType = {
  plan: {
    name: string;
    period: string;
  };
  redirect_url: string;
};

export type VerifySubType = {
  message: string;
  error: boolean;
};
