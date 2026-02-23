"use client";

import { useValidate } from "@/hooks/user/useValidate";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Validate = () => {
  const { validateUser } = useValidate();
  const pathname = usePathname();

  useEffect(() => {
    validateUser();
  }, [pathname]);

  return <></>;
};

export default Validate;
