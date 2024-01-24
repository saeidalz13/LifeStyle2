import { FormEvent, useRef, useState } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import BACKEND_URL from "../Config";
import rl from "../svg/RotatingLoad.svg";
import StatusCodes from "../StatusCodes";
import gIcon from "../svg/GoogleIcon.svg";

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
      if (passwordRef.current?.value.length <= 8) {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(emailRef.current?.value as string);
    if (!isValid) {
      setLoading(false);
      setErrMsg("Please enter a valid email address!");
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
      }, 5000);
      return;
    } catch (error) {
      console.log(error);
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
            <Form onSubmit={handleSubmitSignup}>
              <legend>Sign Up!</legend>
              <Form.Control
                className="form-control"
                type="text"
                name="email"
                id="email"
                placeholder="Email Address"
                ref={emailRef}
                required
              />
              <Form.Control
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                ref={passwordRef}
                onChange={handlePassword}
                required
              />
              <Form.Control
                className="form-control"
                type="password"
                name="password"
                id="password"
                placeholder="Password Confirmation"
                ref={passwordConfRef}
                required
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
            <Button variant="outline-primary">
              Already Have An Account? Click Here
            </Button>
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

      <div style={{fontSize:"30px"}} className="text-center text-light mb-3">OR</div>
      <div className="text-center">

        <Button variant="dark" style={{boxShadow:"1px 1px 5px rgb(0, 86, 86)"}} onClick={handleGoogleSignIn}>
          {" "}
          <span style={{fontSize:"18px"}}>Sign In With Google </span> <img src={gIcon} alt="Google Icon" height={"60px"} width={"60px"} />
        </Button>
      </div>
    </>
  );
};

export default Signup;
