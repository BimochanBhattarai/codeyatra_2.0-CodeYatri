import { useQuery } from "@tanstack/react-query";

const getAllDriverApplications = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/driver_applications`, {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch driver applications.");
  }

  return json.data ?? [];
};

export const useGetAllDriverApplications = (options = {}) => {
  return useQuery({
    queryKey: ["all-driver-applications"],
    queryFn: getAllDriverApplications,
    ...options,
  });
};