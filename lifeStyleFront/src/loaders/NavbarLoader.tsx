import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";

export const isAuthenticated = async () => {
  const result = await fetch(`${BACKEND_URL}/`, {
    method: "GET",
    credentials: "include",
  });

  if (result.status === StatusCodes.Ok) {
    return true;
  }
  return false;
};
