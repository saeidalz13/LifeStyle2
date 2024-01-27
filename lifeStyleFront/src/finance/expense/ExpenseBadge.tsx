import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import {
  TAllExpensesArr,
  TNoExpensesData,
} from "../../assets/FinanceInterfaces";

interface ExpenseBadgeProps {
  expenseType: string;
  allExpenses: TAllExpensesArr | null | TNoExpensesData | "waiting";
  badgeText: string;
}

const ExpenseBadge: React.FC<ExpenseBadgeProps> = ({ expenseType, allExpenses, badgeText }) => {
  if (allExpenses === "waiting" || allExpenses === null || allExpenses == "nodata") {
    return <div></div>;
  }

  switch (expenseType) {
    case "capital":
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-success" style={{ fontSize: "14px" }}>
            {badgeText} Capital: ${allExpenses.allExpenses.total_capital} &#128184;
          </Badge>
        </div>
      );
    case "eatout":
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-danger" style={{ fontSize: "14px" }}>
            {badgeText} Eatout: ${allExpenses.allExpenses.total_eatout} &#128184;
          </Badge>
        </div>
      );
    case "entertainment":
      return (
        <div className="mt-2 text-center">
          <Badge bg="dark" className="px-3 text-light border border-primary" style={{ fontSize: "14px" }}>
            {badgeText} Entertainment: ${allExpenses.allExpenses.total_entertainment} &#128184;
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
