"use client";

import { createContext, useEffect, useReducer, useState } from "react";

export const AuthContext = createContext();

export const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload.data };
    case "LOGOUT":
      return { user: null };
    case "VALIDATE":
      return { user: action.payload.data };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, { user: null });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      dispatch({ type: "VALIDATE", payload: { data: JSON.parse(stored) } });
    }
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
