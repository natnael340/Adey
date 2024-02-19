import { isSafePath } from "@/app/components/utils";
import { ReadonlyURLSearchParams } from "next/navigation";

export const get_redirect_url = (
  searchParams: ReadonlyURLSearchParams | null
) => {
  const redirect_url = new URLSearchParams(searchParams?.toString()).get(
    "redirect_url"
  );
  if (redirect_url && isSafePath(redirect_url)) {
    return redirect_url;
  }
  return "/dashboard";
};
