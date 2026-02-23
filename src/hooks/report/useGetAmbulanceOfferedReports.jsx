import { useQuery } from "@tanstack/react-query";

export const useGetAmbulanceOfferedReports = () => {
  return useQuery({
    queryKey: ["ambulanceOfferedReports"],
    queryFn: async () => {
      const response = await fetch("/api/report/ambulance_offered_reports", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ambulance offered reports.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
