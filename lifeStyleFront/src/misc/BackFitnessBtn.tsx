import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import Urls from "../Urls";

const BackFitnessBtn = () => {
  return (
    <div className="text-center mt-2">
      <NavLink to={Urls.fitness.index}>
        <Button style={{color:"rgb(249, 215, 215)"}} variant="dark" className="px-4 py-2">&#128170; Back To Fitness</Button>
      </NavLink>
    </div>
  )
}

export default BackFitnessBtn
