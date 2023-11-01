import { FormEvent, useRef } from "react";
import Urls from "../Urls";
import { Link } from "react-router-dom";
import BACKEND_URL from "../Config";

const Signup = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmitSignup(e: FormEvent) {
    e.preventDefault();
    const newUser = {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
    };

    try {
      const result = await fetch(`${BACKEND_URL}/signup`, {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: { "Content-Type": "application/json" },
      });
      console.log(await result.text());

      location.assign(Urls.home)
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
                  Submit
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
      </div>
    </>
  );
};

export default Signup;
