import { useQuery } from "@tanstack/react-query";

export const useGetAllReports = () => {
  return useQuery({
    queryKey: ["allReports"],
    queryFn: async () => {
      const response = await fetch("/api/report/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all reports.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
