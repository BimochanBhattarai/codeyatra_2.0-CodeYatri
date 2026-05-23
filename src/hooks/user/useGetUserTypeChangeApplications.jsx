import { useQuery } from "@tanstack/react-query";

export const useGetUserTypeChangeApplications = () => {
  return useQuery({
    queryKey: ["userTypeChangeApplications"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/user_type_change_applications`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user type change applications.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
