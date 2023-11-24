import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import Urls from "../Urls";

interface User {
  id: number;
  email: string;
  password: string;
  created_at: {
    String: string;
    Valid: boolean;
  };
}

export const fetchUserInfo = async () => {
  try {
    const result = await fetch(`${BACKEND_URL}${Urls.profile}`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.UnAuthorized) {
      location.assign(Urls.login);
      return;
    }

    if (result.status === StatusCodes.Ok) {
      const user = (await result.json()) as User;
      return user;
    }

    location.assign(Urls.login);
    return;
  } catch (error) {
    console.log(error);
    location.assign(Urls.login);
    return;
  }
};
