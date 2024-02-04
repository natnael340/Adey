import { COLORS } from "../constants/consts";
import { ChatFormType } from "../types/types";

export const formUpdated = (current: any, prev: any) => {
  const data: any = {};
  Object.keys(current).forEach((key) => {
    // @ts-ignore
    if (current[key] instanceof Array) {
      if (
        !current[key]
          .sort()
          .every((value: string, idx: number) => value == prev[key].sort()[idx])
      ) {
        data[key] = current[key];
      }
    } else if (current[key] !== prev[key]) {
      // @ts-ignore
      data[key] = current[key];
    }
  });
  console.log(data);
  return { data, status: Object.keys(data).length !== 0 };
};

export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const range = COLORS.length - 1;
  const index = ((hash % range) + range) % range;
  return COLORS[index];
};
