import BACKEND_URL from "../Config";
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
    return result.json();
  } catch (error) {
    console.log(error);
  }
};
