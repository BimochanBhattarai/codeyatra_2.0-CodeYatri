"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { redirect } from "next/navigation";
import { useContext, useEffect } from "react";

export default function isAuthenticated(Component) {
  return function IsAuthenticated(props) {
    const { user } = useContext(AuthContext);

    useEffect(() => {
      if (!user) {
        return redirect("/login");
      }
    }, [user]);

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
