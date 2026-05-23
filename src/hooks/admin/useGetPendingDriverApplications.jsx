import { useQuery } from "@tanstack/react-query";

const getPendingDriverApplications = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/driver_applications/pending`, {
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch pending applications.");
  }

  return json.data ?? [];
};

export const useGetPendingDriverApplications = (options = {}) => {
  return useQuery({
    queryKey: ["pending-driver-applications"],
    queryFn: getPendingDriverApplications,
    ...options,
  });
};
