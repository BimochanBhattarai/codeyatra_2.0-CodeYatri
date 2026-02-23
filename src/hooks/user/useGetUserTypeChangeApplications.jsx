import { useQuery } from "@tanstack/react-query";

export const useGetUserTypeChangeApplications = () => {
  return useQuery({
    queryKey: ["userTypeChangeApplications"],
    queryFn: async () => {
      const response = await fetch("/api/user/user_type_change_applications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user type change applications.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
