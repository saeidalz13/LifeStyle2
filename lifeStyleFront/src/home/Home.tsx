import { useEffect, useRef, useState } from "react";
import Navbar from "../layout/Navbar";
import Panels from "./Panels";

const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const mounted = useRef(true)
  useEffect(() => {
    if (mounted.current) {
      mounted.current = false
      const fetchData = async () => {
        try {
          const result = await fetch("http://localhost:1300/", {
            method: "GET",
            credentials: "include"
          });
  
          const isSignedIn = await result.json();
          console.log(isSignedIn)
          if (isSignedIn.success) {
            setIsAuthorized(true)
          } else {
            setIsAuthorized(false)
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, []);

  return (
    <div>
      <Navbar isAuth={isAuthorized}/>
      <h1>Discipline your life style...</h1>
      <Panels isAuth={isAuthorized}/>
    </div>
  );
};

export default Home;
