import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import Urls from "../Urls";

const BackFitnessBtn = () => {
  return (
    <div className="text-center mt-2">
      <NavLink to={Urls.fitness.index}>
        <Button variant="danger" className="px-4 py-2 all-budget-choices">&#128170; Back To Fitness</Button>
      </NavLink>
    </div>
  )
}

export default BackFitnessBtn
