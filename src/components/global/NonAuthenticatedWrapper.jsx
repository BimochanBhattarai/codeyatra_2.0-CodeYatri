"use client";

import isNotAuthenticated from "@/utils/isNotAuthenticated";

const NonAuthenticatedWrapper = ({ children }) => {
  return <>{children}</>;
};

export default isNotAuthenticated(NonAuthenticatedWrapper);
