import Axios, { AxiosInstance } from "axios";
import { ChatDetailType, ChatFormType, ChatType } from "../types/types";

const axios = Axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1/",
});

class Api {
  private token: string;
  private axios: AxiosInstance;

  constructor(token: string) {
    this.token = token;
    this.axios = Axios.create({
      baseURL: "http://127.0.0.1:8000/api/v1/",
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
  }

  async get_chatbots() {
    const { data } = await this.axios.get<ChatType[]>("rag/chats");
    return data;
  }
  async get_chatbot(slug: string) {
    const { data } = await this.axios.get<ChatType>(`rag/chats/${slug}`);
    return data;
  }
  async create_chatbot(chatForm: ChatFormType) {
    const { data } = await this.axios.post<ChatFormType>("rag/chat/", chatForm);
    return data;
  }
}

export default Api;
