import { createContext, useState, useEffect, ReactNode, useRef } from "react";
import BACKEND_URL from "../Config";
import StatusCodes from "../StatusCodes";
import { User } from "../assets/AuthInterfaces";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userEmail: string;
  setUserEmail: React.Dispatch<React.SetStateAction<string>>;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  userEmail: "",
  setUserEmail: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const mounted = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const checkAuthStatus = async () => {
        try {
          const result = await fetch(`${BACKEND_URL}/profile`, {
            method: "GET",
            credentials: "include",
          });


          if (result.status === StatusCodes.Ok) {
            const data = await result.json() as User;
            setIsAuthenticated(true);
            setUserEmail(data.email);
          }
        } catch (error) {
          console.error("Error checking authentication status: ", error);
          setIsAuthenticated(false);
        }
      };

      checkAuthStatus();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userEmail, setUserEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
