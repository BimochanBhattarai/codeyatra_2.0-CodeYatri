import { useMutation } from "@tanstack/react-query";

export const useVerifyPhone = () => {
  return useMutation({
    mutationFn: async ({ user_id, verification_code }) => {
      const response = await fetch("/api/user/verify_phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          verification_code,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to verify phone number.",
        );
      }

      return responseData;
    },
  });
};
