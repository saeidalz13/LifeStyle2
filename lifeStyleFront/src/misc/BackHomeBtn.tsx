import { NavLink } from "react-router-dom";
import { Button } from "react-bootstrap";
import Urls from "../Urls";


const BackHomeBtn = () => {
  return (
    <div className="text-center mt-2">
      <NavLink to={Urls.home}>
        <Button style={{color:"rgb(249, 215, 215)"}} variant="dark" className="px-5 py-2">&#127968; Home</Button>
      </NavLink>
    </div>
  );
};

export default BackHomeBtn;
