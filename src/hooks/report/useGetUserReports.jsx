import { useQuery } from "@tanstack/react-query";

export const useGetUserReports = () => {
  return useQuery({
    queryKey: ["userReports"],
    queryFn: async () => {
      const response = await fetch("/api/report/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user reports.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
