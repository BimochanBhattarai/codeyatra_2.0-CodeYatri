"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { redirect } from "next/navigation";
import { useContext, useEffect } from "react";

export default function isNotAuthenticated(Component) {
  return function IsNotAuthenticated(props) {
    const { user } = useContext(AuthContext);

    useEffect(() => {
      if (user) {
        return redirect("/dashboard");
      }
    }, [user]);

    return <Component {...props} />;
  };
}
