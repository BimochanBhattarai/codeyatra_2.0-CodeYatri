import { useMutation } from "@tanstack/react-query";

export const useRejectReport = () => {
  return useMutation({
    mutationFn: async (reportId) => {
      const response = await fetch(`/api/report/reject/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reject report.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
