import { FormEvent, useRef, useState } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import BACKEND_URL from "../Config";
import rl from "../svg/RotatingLoad.svg";
import StatusCodes from "../StatusCodes";

const Signup = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [err, setErr] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmitSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const newUser = {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const result = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const resp = await result.json();

      if (result.status === StatusCodes.Ok) {
        setSuccess(true)
        setLoading(false);
        location.assign(Urls.home);
        return;
      } else if (result.status === StatusCodes.UnAuthorized) {
        setErr(true);
        setErrMsg(resp.message);
        setLoading(false);
        setTimeout(() => {
          setErr(false);
        }, 5000);
      } else return;
    } catch (error) {
      setErr(true);
      setLoading(false);
      setErrMsg("Something went wrong");
      console.log(error);
      setTimeout(() => {
        setErr(false);
      }, 5000);
      return;
    }
  }

  return (
    <>
      <div className="container mt-5 mb-5 mx-auto">
        <div className="row">
          <div className="col mx-5">
            <div style={{ marginBottom: "20px" }}>
              <Link to={Urls.home}>
                <button
                  className="btn btn-success"
                  style={{ padding: "8px 20px" }}
                >
                  Home
                </button>
              </Link>
            </div>
            <form onSubmit={handleSubmitSignup}>
              <legend>Sign Up!</legend>
              <input
                className="form-control"
                type="text"
                name="email"
                id="email"
                placeholder="Email Address"
                ref={emailRef}
              />
              <input
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                ref={passwordRef}
              />
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <button type="submit" className="btn btn-danger submit-btn">
                  {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to={Urls.login}>
            <button className="btn btn-info">
              Already Have An Account? Click Here
            </button>
          </Link>
        </div>
        {err && (
          <div className="alert alert-warning mt-2 text-center mx-5 p-2">
            {errMsg}
          </div>
        )}
        {success && (
          <div className="alert alert-success mt-2 text-center mx-5 p-2">
            Signed in successfully! Redirecting to home page...
          </div>
        )}
      </div>
    </>
  );
};

export default Signup;
