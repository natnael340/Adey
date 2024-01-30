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
