import BACKEND_URL from "../Config";

export const isAuthenticated = async () => {
  const result = await fetch(`${BACKEND_URL}/`, {
    method: "GET",
    credentials: "include",
  });

  // React will take care of the promise handling
  const isAuth = (await result.json()) as IIfAuth;
  if (isAuth.responseType === "error") {
    return false;
  }
  return true;
};

interface IIfAuth {
  responseType: string;
  Msg: string;
}
