import { useEffect, useRef } from "react";
import Navbar from "../layout/Navbar";
import Panels from "./Panels";

const Home = () => {

  const mounted = useRef(true)
  useEffect(() => {
    if (mounted.current) {
      mounted.current = false
      const fetchData = async () => {
        try {
          const result = await fetch("http://localhost:1300/", {
            method: "GET",
          });
  
          const data = await result.json();
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    }
  }, []);

  return (
    <div>
      <Navbar />
      <h1>Discipline your life style...</h1>
      <Panels />
    </div>
  );
};

export default Home;
