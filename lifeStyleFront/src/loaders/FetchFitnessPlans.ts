import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import Urls from "../Urls";

export const fetchFitnessPlans = async () => {
  try {
    const result = await fetch(`${BACKEND_URL}${Urls.fitness.getAllPlans}`, {
      method: "GET",
      credentials: "include",
    });

    if (result.status === StatusCodes.UnAuthorized) {
      location.assign(Urls.login);
      return;
    }

    if (result.status === StatusCodes.Ok) {
      return result.json();
    }

    if (result.status === StatusCodes.InternalServerError) {
      return null;
    }

    location.assign(Urls.login);
    return;
  } catch (error) {
    location.assign(Urls.login);
  }
};
