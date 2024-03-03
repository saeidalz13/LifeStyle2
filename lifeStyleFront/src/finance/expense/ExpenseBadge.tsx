import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import {
  // TAllExpensesArr,
  // TNoExpensesData,
  TExpenseData,
  EXPENSE_TYPES,
} from "../../assets/FinanceInterfaces";

interface ExpenseBadgeProps {
  data: TExpenseData;
  badgeText: string;
}

const ExpenseBadge: React.FC<ExpenseBadgeProps> = ({ data, badgeText }) => {
  if (data === "waiting" || data === null || data == "nodata") {
    return <div></div>;
  }

  switch (data.expense_type) {
    case EXPENSE_TYPES.cap:
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-success" style={{ fontSize: "14px" }}>
            {badgeText} Capital: ${data.total_row_count_capital.total} &#128184;
          </Badge>
        </div>
      );
    case EXPENSE_TYPES.eat:
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-danger" style={{ fontSize: "14px" }}>
            {badgeText} Eatout: ${data.total_row_count_eatout.total} &#128184;
          </Badge>
        </div>
      );
    case EXPENSE_TYPES.ent:
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-primary" style={{ fontSize: "14px" }}>
            {badgeText} Entertainment: ${data.total_row_count_entertainment.total} &#128184;
          </Badge>
        </div>
      );
    default:
      return (
        <div className="mt-2 text-center">
          <Button variant="light">Invalid type for expenses!</Button>
        </div>
      );
  }
};

export default ExpenseBadge;
