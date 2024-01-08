import { ImageProps } from "next/image";

export type ChatType = {
  identifier: string;
  name: string;
  slug: string;
  assistant_name: string;
  business_description: string;
  business_name: string;
  assistant_characters: {
    name: string;
  }[];
  assistant_picture_url: string;
  resources: number;
  conversations: number;
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
  business_name: string;
  business_description: string;
};
