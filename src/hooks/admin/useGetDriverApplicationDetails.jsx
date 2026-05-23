import { useQuery } from "@tanstack/react-query";

const getDriverApplicationDetails = async (driverId) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/driver_applications/${driverId}`, {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch application details.");
  }

  return json.data;
};

export const useGetDriverApplicationDetails = (driverId, options = {}) => {
  return useQuery({
    queryKey: ["driver-application-details", driverId],
    queryFn: () => getDriverApplicationDetails(driverId),
    enabled: !!driverId,
    ...options,
  });
};