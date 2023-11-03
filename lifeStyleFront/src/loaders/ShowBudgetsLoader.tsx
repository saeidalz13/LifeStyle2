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
    if (!result.ok) {
      if (result.status === 401) {
        location.href = Urls.login
      }
      throw new Error('Network response was not ok.');
    }
    return result.json();
  } catch (error) {
    console.log(error);
  }
};
