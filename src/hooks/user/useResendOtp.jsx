import { useMutation } from "@tanstack/react-query";

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async ({ user_id }) => {
      const response = await fetch("/api/user/resend_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to resend OTP.");
      }

      return responseData;
    },
  });
};
