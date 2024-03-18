import { FormEvent, useRef, useState } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import BACKEND_URL from "../Config";
import rl from "../svg/RotatingLoad.svg";
import gIcon from "../svg/GoogleIcon.svg";
import StatusCodes from "../StatusCodes";
import { Button } from "react-bootstrap";

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  async function handleSubmitLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const loginUser = {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const result = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        body: JSON.stringify(loginUser),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const resp = await result.json();
      if (
        result.status === StatusCodes.InternalServerError ||
        result.status === StatusCodes.UnAuthorized
      ) {
        setLoading(false);
        setErr(true);
        setErrMsg(resp.message);
        console.log(resp);
        setTimeout(() => {
          setErr(false);
        }, 5000);
      } else if (result.status === StatusCodes.Ok) {
        setSuccess(true);
        setSuccessMsg(resp.message);
        location.assign(Urls.home);
      } else {
        setErr(true);
        setErrMsg("Unexpected Error Happened, Try again later!");
        setTimeout(() => {
          setErr(false);
        }, 5000);
      }
    } catch (error) {
      console.log(error);
      setErr(true);
      setErrMsg("Unexpected Error Happened, Try again later!");
      setTimeout(() => {
        setErr(false);
      }, 5000);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await fetch(`${BACKEND_URL}${Urls.googleSignIn}`, {
        method: "GET",
      });

      if (result.status === StatusCodes.Ok) {
        const googleUrl = (await result.json()) as { googleUrl: string };
        location.assign(googleUrl.googleUrl);
        return;
      }

      setErrMsg("Unexpected Error Happened, Try again later!");
      setTimeout(() => {
        setErrMsg("");
        setErr(false);
      }, 5000);
      return;
    } catch (error) {
      console.log(error);
      setErr(true);
      setErrMsg("Server might have run into some issues! sorry for the inconvenience");
      setTimeout(() => {
        setErr(false);
      }, 5000);
      return;
    }
  };

  return (
    <>
      <div className="container mt-5 mb-3 mx-auto">
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
            <form onSubmit={handleSubmitLogin}>
              <legend>Log In!</legend>
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
                  {loading ? <img  src={rl} alt="Rotation" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to={Urls.signup}>
            <Button variant="outline-primary">
              Need An Account? Click Here
            </Button>
          </Link>
        </div>

        {err && (
          <div className="alert alert-warning mt-2 text-center mx-5 p-2">
            {errMsg}
          </div>
        )}
        {success && (
          <div className="alert alert-success mt-2 text-center mx-5 p-2">
            {successMsg}
          </div>
        )}
      </div>

      <div style={{ fontSize: "30px" }} className="text-center text-light mb-3">
        OR
      </div>
      <div className="text-center">
        <Button
          variant="dark"
          style={{ boxShadow: "1px 1px 5px rgb(0, 86, 86)" }}
          onClick={handleGoogleSignIn}
        >
          {" "}
          <span style={{ fontSize: "18px" }}>Sign In With Google </span>{" "}
          <img src={gIcon} alt="Google Icon" height={"60px"} width={"60px"} />
        </Button>
      </div>
    </>
  );
};

export default Login;
