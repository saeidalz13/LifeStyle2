import { NavLink } from "react-router-dom"
import Urls from "../Urls"
import { Button } from "react-bootstrap"

const BackFinance = () => {
  return (
    <div className="mt-2 text-center">
    <NavLink to={Urls.finance.index}>
      <Button style={{color:"rgb(249, 215, 215)"}} variant="dark">&#x21ba; Finance</Button>
    </NavLink>
  </div>
  )
}

export default BackFinance
