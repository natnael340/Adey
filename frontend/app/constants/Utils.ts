import jwt, { JwtPayload } from "jsonwebtoken";

export namespace JwtUtils {
  export const isJwtExpired = (token: string) => {
    const currentTime = Math.round(Date.now() / 1000 + 60);
    const decoded: JwtPayload | null = jwt.decode(token) as JwtPayload;

    if (decoded?.exp) {
      const adjustedExpiry = decoded.exp;
      if (adjustedExpiry < currentTime) {
        console.log("Token expired");
        return true;
      }
      console.log("Token not expired");
      return false;
    }
    console.log("no Token exp");
    return true;
  };
}
