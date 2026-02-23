import { useMutation } from "@tanstack/react-query";

export const useCancelReport = () => {
  return useMutation({
    mutationFn: async (reportId) => {
      const response = await fetch(`/api/report/cancel/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel report.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
