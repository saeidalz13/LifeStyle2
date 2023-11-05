import { useEffect, useRef, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import BACKEND_URL from "../../Config";
import Urls from "../../Urls";
import StatusCodes from "../../StatusCodes";
import rl from "../../svg/RotatingLoad.svg";

interface IBalance {
  balanceId: number;
  budgetId: number;
  userId: number;
  capital: number;
  eatout: number;
  entertainment: number;
  total: number;
  createdAt: Date;
}

type TNoBalance = "NoBalance";

const BalanceIndex = () => {
  const { id } = useParams();
  const mounted = useRef(true);
  const [balance, setBalance] = useState<IBalance | null | TNoBalance>(null);

  useEffect(() => {
    if (mounted.current) {
      mounted.current = false;

      const fetchSingleBalance = async () => {
        const result = await fetch(
          `${BACKEND_URL}${Urls.finance.index}/${Urls.finance.balance}/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (result.status === StatusCodes.Accepted) {
          const data = await result.json();
          setBalance(data);
        } else if (result.status === StatusCodes.NoContent) {
          setBalance("NoBalance");
        } else if (result.status === StatusCodes.InternalServerError) {
          console.log("Failed to fetch the data!");
          setBalance(null);
        } else {
          console.log("Unexpected error happened!");
          setBalance(null);
        }
      };

      fetchSingleBalance();
    }
  }, [id]);

  if (!balance) {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`/finance/show-all-budgets`}>
            <button className="btn btn-secondary">Back To Budgets</button>
          </NavLink>
        </div>

        <div className="mt-5" style={{ textAlign: "center" }}>
          <img src={rl} height="150px" width="150px" alt="Rotation" />
        </div>
      </>
    );
  }

  if (balance === "NoBalance") {
    return (
      <>
        <div className="text-center mt-4 mb-3">
          <NavLink to={`/finance/show-all-budgets`}>
            <button className="btn btn-secondary">Back To Budgets</button>
          </NavLink>
        </div>
        <h1>No Balance...</h1>
      </>
    );
  }

  return (
    <>
      <div className="text-center mt-4 mb-3">
        <div className="text-center mt-4 mb-3">
          <NavLink to={`/finance/show-all-budgets`}>
            <button className="btn btn-secondary">Back To Budgets</button>
          </NavLink>
        </div>
      </div>
      <div className="mx-5">
        <ul className="list-group ">
          <li className="list-group-item list-group-item-action list-group-balance list-item-capital-balance">
            &#128176; Capital &#x1F449; ${balance.capital}
          </li>
          <li className="list-group-item list-group-item-action list-group-balance list-item-eatout-balance">
            &#128176; Eatout &#x1F449; ${balance.eatout}
          </li>
          <li className="list-group-item list-group-item-action list-group-balance list-item-entert-balance">
            &#128176; Entertainment &#x1F449; ${balance.entertainment}
          </li>
          <li className="list-group-item list-group-item-action list-group-balance list-item-total-balance">
            &#128176; Total &#x1F449; ${balance.total}
          </li>
        </ul>
      </div>
    </>
  );
};

export default BalanceIndex;