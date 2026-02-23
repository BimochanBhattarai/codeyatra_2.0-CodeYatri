import { useMutation } from "@tanstack/react-query";

export const useVerifyReport = () => {
  return useMutation({
    mutationFn: async (reportId) => {
      const response = await fetch(`/api/report/verify/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to verify report.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
