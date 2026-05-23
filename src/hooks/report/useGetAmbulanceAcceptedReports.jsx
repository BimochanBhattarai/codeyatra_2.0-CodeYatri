import { useQuery } from "@tanstack/react-query";

export const useGetAmbulanceAcceptedReports = () => {
  return useQuery({
    queryKey: ["ambulanceAcceptedReports"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ambulance_driver/accepted_reports`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch ambulance accepted reports.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};