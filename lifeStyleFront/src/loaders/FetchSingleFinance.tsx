import StatusCodes from "../StatusCodes";
import Urls from "../Urls";

export const fetchSingleFinance = async () => {
  try {
    const result = await fetch(`${Urls.finance.showBudgets}`, {
      method: "GET",
      credentials: "include",
    });

    if (
      result.status === StatusCodes.InternalServerError ||
      result.status === StatusCodes.Ok
    ) {
      return result.json();
    }
    location.assign(Urls.login);
    return;
  } catch (error) {
    console.log(error);
    location.assign(Urls.login);
    return;
  }
};
