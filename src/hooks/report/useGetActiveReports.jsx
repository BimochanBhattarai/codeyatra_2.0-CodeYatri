import { useQuery } from "@tanstack/react-query";

export const useGetActiveReports = () => {
  return useQuery({
    queryKey: ["activeReports"],
    queryFn: async () => {
      const response = await fetch("/api/report/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active reports.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
