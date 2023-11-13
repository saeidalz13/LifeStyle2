import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";

export const isAuthenticated = async () => {
  try {
    const result = await fetch(`${BACKEND_URL}/`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.Ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
