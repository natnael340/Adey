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
