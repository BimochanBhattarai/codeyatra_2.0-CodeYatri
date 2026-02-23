import { AuthContext } from "@/contexts/AuthProvider";
import { useContext } from "react";

/**
 * Custom hook to validate user token
 * @returns {Object} - Object containing the validateUser function
 */
export const useValidate = () => {
  const { dispatch } = useContext(AuthContext);

  /**
   * Function to validate user token
   */
  const validateUser = async () => {
    const response = await fetch(`/api/user/verify_user_token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      localStorage.removeItem("user");
      dispatch({ type: "VALIDATE", payload: { user: null } });
    }

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.data));
      dispatch({ type: "VALIDATE", payload: data });
    }
  };
  return { validateUser };
};
