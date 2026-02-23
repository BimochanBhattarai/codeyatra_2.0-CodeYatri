"use client";

import isAuthenticated from "@/utils/isAuthenticated";

const AuthenticatedWrapper = ({ children }) => {
  return <>{children}</>;
};

export default isAuthenticated(AuthenticatedWrapper);