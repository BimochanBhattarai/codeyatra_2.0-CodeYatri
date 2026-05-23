import { useMutation, useQueryClient } from "@tanstack/react-query";

const approveDriverApplication = async (driverId) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/driver_applications/${driverId}/approve`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to approve driver application.");
  }

  return json;
};

export const useApproveDriverApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveDriverApplication,
    onSuccess: (_, driverId) => {
      queryClient.invalidateQueries({
        queryKey: ["pending-driver-applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["all-driver-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["driver-application-details", driverId],
      });
    },
  });
};
