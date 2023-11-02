import { useLoaderData } from "react-router-dom";

type Budgets = {
  budgets: Array<{
    budgetId: number;
    capital: number;
    eatout: number;
    endDate: string;
    entertainment: number;
    income: number;
    savings: number;
    startDate: string;
    userId: number;
  }>;
};

const ShowAllBudgets = () => {
  const result = useLoaderData() as Budgets;

  return (
    <>
      <div className="list-group mx-5 mt-5">
        {/* <h3 className="mt-1 text-center">Budgets</h3> */}
        {result.budgets.map((budget) => (
          <button
						key={String(budget.budgetId)}
            type="button"
            className="list-group-item list-group-item-action p-2"
						style={{borderColor:"lightpink"}}
          >
          <h5>Bugdet ID: {budget.budgetId} <br /></h5>
					&#128337; <span style={{color:"greenyellow"}}>Start Date: {budget.startDate.substring(0, budget.startDate.length - 10)} <br /></span>
					&#128337; <span style={{color:"hotpink"}} >End Date: {budget.endDate.substring(0, budget.endDate.length - 10)} <br /></span> 
					&#128184; Income: ${budget.income} | Savings: ${budget.savings} <br />
          </button>
        ))}
      </div>
    </>
  );
};

export default ShowAllBudgets;
