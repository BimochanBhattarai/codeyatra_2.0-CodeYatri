import { useMutation } from "@tanstack/react-query";

export const useLogoutUser = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to logout user.");
      }

      return responseData;
    },
  });
};
