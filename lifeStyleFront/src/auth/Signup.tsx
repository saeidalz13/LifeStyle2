import { FormEvent, useRef, useState } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import BACKEND_URL from "../Config";
import rl from "../svg/RotatingLoad.svg";
import StatusCodes from "../StatusCodes";

const Signup = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [errMsg, setErrMsg] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [passMsg, setPassMsg] = useState<string>("");

  function handlePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const enteredPass = e.target.value;
    if (enteredPass.length === 0) {
      setPassMsg("");
      return;
    }

    if (enteredPass.length < 8) {
      setPassMsg("Password must be more than 8 characters");
      return;
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(enteredPass)) {
      setPassMsg(
        "Password must contain at least one upper case letter and one number"
      );
      return;
    }

    setPassMsg("");
    return;
  }

  async function handleSubmitSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (passwordRef.current?.value) {
      if (passwordRef.current?.value.length < 8) {
        setLoading(false);
        setErrMsg("Password must be at least 8 characters");
        setTimeout(() => {
          setErrMsg("");
        }, 5000);
        return;
      }

      if (!/(?=.*[A-Z])(?=.*\d)/.test(passwordRef.current?.value)) {
        setLoading(false);
        setErrMsg(
          "Password must contain at least one upper case letter and one number"
        );
        setTimeout(() => {
          setErrMsg("");
        }, 5000);
        return;
      }
    }

    if (passwordRef.current?.value !== passwordConfRef.current?.value) {
      setLoading(false);
      setErrMsg("Password confirmation does not match the initial password");
      setTimeout(() => {
        setErrMsg("");
      }, 5000);
      return;
    }

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
      setLoading(false);
      const resp = await result.json();

      if (result.status === StatusCodes.Ok) {
        setSuccess(true);
        location.assign(Urls.home);
        return;
      }

      if (result.status === StatusCodes.UnAuthorized) {
        setErrMsg(resp.message);
        setTimeout(() => {
          setErrMsg("");
        }, 5000);
        return;
      }

      if (result.status === StatusCodes.InternalServerError) {
        setErrMsg(resp.message);
        setTimeout(() => {
          setErrMsg("");
        }, 5000);
        return;
      }

      setTimeout(() => {
        setErrMsg("Something went wrong! Try again later");
      }, 5000);
      return;
    } catch (error) {
      setLoading(false);
      setErrMsg("Something went wrong");
      console.log(error);
      setTimeout(() => {
        setErrMsg("");
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
            <Form onSubmit={handleSubmitSignup}>
              <legend>Sign Up!</legend>
              <Form.Control
                className="form-control"
                type="text"
                name="email"
                id="email"
                placeholder="Email Address"
                ref={emailRef}
              />
              <Form.Control
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                ref={passwordRef}
                onChange={handlePassword}
              />
              <Form.Control
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="Password Confirmation"
                ref={passwordConfRef}
              />
              <Form.Text className="text-danger">{passMsg}</Form.Text>
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <button type="submit" className="btn btn-danger submit-btn">
                  {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
                </button>
              </div>
            </Form>
          </div>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to={Urls.login}>
            <button className="btn btn-info">
              Already Have An Account? Click Here
            </button>
          </Link>
        </div>
        {errMsg !== "" ? (
          <div style={{fontSize:"18px"}}  className="alert alert-warning mt-2 text-center mx-5 p-2">
            {errMsg}
          </div>
        ) : (
          errMsg
        )}
        {success && (
          <div style={{fontSize:"18px"}} className="alert alert-success mt-2 text-center mx-5 p-2">
            Signed in successfully! Redirecting to home page...
          </div>
        )}
      </div>
    </>
  );
};

export default Signup;
