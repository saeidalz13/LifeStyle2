import { FormEvent, useRef, useState } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import BACKEND_URL from "../Config";
import rl from "../svg/RotatingLoad.svg"

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [successMsg, setSuccessMsg] = useState<string>("")

  async function handleSubmitLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true)
    const loginUser = {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const result = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        body: JSON.stringify(loginUser),
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });
      const resp = await result.json();

      if (resp.responseType === "error") {
        setLoading(false)
        setErr(true)
        setErrMsg(resp.message)
        console.log(resp)
        setTimeout(() => {
          setErr(false)
        }, 5000)

      } else {
        setSuccess(true)
        setSuccessMsg(resp.message)
        location.assign(Urls.home)
      }
      
    } catch (error) {
      console.log(error);
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
                  {loading ? <img src={rl} alt="Rotation" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <Link to={Urls.signup}>
            <button className="btn btn-info">
              Need An Account? Click Here
            </button>
          </Link>
        </div>

        {err && <div className="alert alert-warning mt-2 text-center mx-5 p-2">{errMsg}</div>}
        {success && <div className="alert alert-success mt-2 text-center mx-5 p-2">{successMsg}</div>}
      </div>
    </>
  );
};

export default Login;
