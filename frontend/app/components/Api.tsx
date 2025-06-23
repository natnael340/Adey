import Axios, { AxiosInstance } from "axios";
import {
  ChatDetailType,
  ChatFormType,
  ChatType,
  DashboardDataType,
  PlanResponseType,
  PlanType,
  ResourceDataTypeWithPagination,
  ResourceFormType,
  GenericResponseType,
  ThemeType,
} from "../types/types";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_PROTOCOL}://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}`;

export const api = Axios.create({
  baseURL: `${BASE_URL}/api/v1/`,
});

class Api {
  private token: string;
  private axios: AxiosInstance;

  constructor(token: string) {
    this.token = token;
    this.axios = Axios.create({
      baseURL: `${BASE_URL}/api/v1/`,
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
  }

  get_token() {
    return this.token;
  }

  async get_chatbots() {
    const { data } = await this.axios.get<ChatType[]>("rag/chats");
    return data;
  }
  async get_chatbot(slug: string) {
    const { data } = await this.axios.get<ChatDetailType>(`rag/chats/${slug}`);
    return data;
  }
  async create_chatbot(chatForm: ChatFormType) {
    const { data } = await this.axios.post<ChatFormType>(
      "rag/chats/",
      chatForm
    );
    return data;
  }
  async get_messages() {
    const { data } = await this.axios.get<ChatDetailType>(
      `rag/chat/user_messages`
    );
    return data;
  }
  async add_tool(chat_slug: string, tool: string) {
    const { data } = await this.axios.post<GenericResponseType>(
      `rag/chat/${chat_slug}/tools/${tool}`
    );
    return data;
  }
  async remove_tool(chat_slug: string, tool: string) {
    const { data } = await this.axios.delete<GenericResponseType>(
      `rag/chat/${chat_slug}/tools/${tool}`
    );
    return data;
  }
  async update_chatbot(
    slug: string,
    chatForm: ChatFormType,
    prev: ChatFormType
  ) {
    const req_data: any = {};
    Object.keys(chatForm).forEach((key) => {
      // @ts-ignore
      if (chatForm[key] !== prev[key]) {
        // @ts-ignore
        req_data[key] = chatForm[key];
      }
    });
    const { data } = await this.axios.patch<ChatFormType>(
      `rag/chats/${slug}/`,
      req_data
    );
    return data;
  }
  async get_preferences() {
    const { data } = await this.axios.get<ThemeType[]>(
      "rag/widget/preferences/"
    );

    return data;
  }

  async set_preference(chat_slug: string, identifier: string) {
    const { data } = await this.axios.post<ThemeType[]>(
      `rag/chat/${chat_slug}/preference/${identifier}/`
    );

    return data;
  }
  async create_resource(chat_slug: string, resource_form: ResourceFormType) {
    const form = new FormData();
    const name_blob = new Blob([JSON.stringify({ name: resource_form.name })], {
      type: "application/json",
    });
    form.append("name", resource_form.name);
    form.append("document", resource_form.document);

    const { data } = await this.axios.post<ResourceFormType>(
      `rag/${chat_slug}/resource/`,
      form
    );

    return data;
  }
  async get_resources(chat_slug: string) {
    const { data } = await this.axios.get<ResourceDataTypeWithPagination>(
      `rag/${chat_slug}/resource/`
    );
    return data;
  }

  async update_resource(
    chat_slug: string,
    resource_slug: string,
    resource_form: ResourceFormType
  ) {
    if (resource_form.document) {
      const form = new FormData();
      form.append("name", resource_form.name);
      form.append("document", resource_form.document);
      const { data } = await this.axios.post<ResourceFormType>(
        `rag/${chat_slug}/resource/${resource_slug}/`,
        form
      );
      return data;
    } else {
      const { data } = await this.axios.patch<ResourceFormType>(
        `rag/${chat_slug}/resource/${resource_slug}/`,
        { name: resource_form.name }
      );
      return data;
    }
  }

  async remove_resource(chat_slug: string, resource_slug: string) {
    const { data } = await this.axios.delete<ResourceFormType>(
      `rag/${chat_slug}/resource/${resource_slug}/`
    );
    return data;
  }

  async build_chatbot(chat_slug: string) {
    await this.axios.get(`rag/chat/${chat_slug}/build`);
  }

  async get_dashboard() {
    const { data } = await this.axios.get<DashboardDataType>("rag/dashboard/");

    return data;
  }

  async checkout(id: string) {
    const { data } = await this.axios.get<PlanResponseType>(
      `user/subscribe/${id}`
    );

    return data;
  }

  async check_status(id: string) {
    const { data } = await this.axios.get<GenericResponseType>(
      `user/subscription/check/${id}`
    );

    return data;
  }
  async get_plan(id: string) {
    const { data } = await api.get<PlanType>(`plans/${id}/`);

    return data;
  }
}

export default Api;
