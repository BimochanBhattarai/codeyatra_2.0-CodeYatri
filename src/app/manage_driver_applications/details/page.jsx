import AuthenticatedWrapper from "@/components/global/AuthenticatedWrapper";
import React from "react";
import DriverApplicationDetailsPage from "./components/DriverApplicationDetails";

const page = () => {
  return (
    <AuthenticatedWrapper>
      <DriverApplicationDetailsPage />
    </AuthenticatedWrapper>
  );
};

export default page;
