import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import Urls from "../Urls";

export const FetchAllBudgets = async () => {
  try {
    const result = await fetch(
      `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.showBudgets}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (result.status === StatusCodes.UnAuthorized) {
      location.assign(Urls.login);
      return {};
    } else if (result.status === StatusCodes.InternalServerError) {
      return {};
    } else if (result.status === StatusCodes.Ok) {
      return result.json();
    } else {
      location.assign(Urls.login);
      return {};
    }
  } catch (error) {
    console.log(error);
    location.assign(Urls.login);
    return {};
    // throw new Error("Network response was not ok.");
  }
};
