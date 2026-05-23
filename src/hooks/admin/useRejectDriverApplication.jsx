import { useMutation, useQueryClient } from "@tanstack/react-query";

const rejectDriverApplication = async (driverId) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/driver_applications/${driverId}/reject`, {
    method: "POST",
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to reject driver application.");
  }

  return json;
};

export const useRejectDriverApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDriverApplication,
    onSuccess: (_, driverId) => {
      queryClient.invalidateQueries({ queryKey: ["pending-driver-applications"] });
      queryClient.invalidateQueries({ queryKey: ["all-driver-applications"] });
      queryClient.invalidateQueries({ queryKey: ["driver-application-details", driverId] });
    },
  });
};