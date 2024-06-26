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
  userId: number;
  setUserId: React.Dispatch<React.SetStateAction<number>>;
  loadingAuth: boolean;
  setLoadingAuth: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  userEmail: "",
  setUserEmail: () => {},
  userId: -1,
  setUserId: () => {},
  loadingAuth: true,
  setLoadingAuth: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const mounted = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<number>(-1);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      console.log("auth context ran to fetch data of user");
      const checkAuthStatus = async () => {
        try {
          const result = await fetch(`${BACKEND_URL}/profile`, {
            method: "GET",
            credentials: "include",
          });

          if (result.status === StatusCodes.Ok) {
            const data = (await result.json()) as User;
            setIsAuthenticated(true);
            setUserEmail(data.email);
            setUserId(data.id);
          }

          setLoadingAuth(false);
        } catch (error) {
          console.error("Error checking authentication status: ", error);
          setIsAuthenticated(false);
          setLoadingAuth(false);
        }
      };

      checkAuthStatus();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userEmail,
        setUserEmail,
        userId,
        setUserId,
        loadingAuth,
        setLoadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
