import { useQuery } from "@tanstack/react-query";

export const useGetReportById = (reportId) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const response = await fetch(`/api/report/track/${reportId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch report.");

      const data = await response.json();
      return data.data;
    },
    enabled: false,
    retry: false,
    staleTime: 0,
  });
};
