import { useQuery } from "@tanstack/react-query";

export const useGetGlobals = () => {
  return useQuery({
    queryKey: ["globalSettings"],
    queryFn: async () => {
      const response = await fetch("/api/global", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch global settings.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
