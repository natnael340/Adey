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
