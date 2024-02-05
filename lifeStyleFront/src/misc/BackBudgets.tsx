import { Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const BackBudgets = () => {
  return (
    <div className="text-center mt-3">
      <NavLink to={`/finance/show-all-budgets`}>
        <Button variant="dark" style={{color:"rgb(249, 215, 215)"}}>
          &#x21ba; Budgets
        </Button>
      </NavLink>
    </div>
  );
};

export default BackBudgets;
