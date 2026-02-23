import { useMutation } from "@tanstack/react-query";

export const useLoginUser = () => {
  return useMutation({
    mutationFn: async ({ phone_number, password }) => {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number,
          password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to login user.");
      }

      return responseData;
    },
  });
};
