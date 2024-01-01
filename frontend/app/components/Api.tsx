import Axios, { AxiosInstance } from "axios";
import { ChatDetailType, ChatType } from "../types/types";

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
    const { data } = await this.axios.get<ChatType>("rag/chat");
    return data;
  }
  async get_chatbot(slug: string) {
    const { data } = await this.axios.get<ChatDetailType>(`rag/chat/${slug}`);
    return data;
  }
}

export default Api;
