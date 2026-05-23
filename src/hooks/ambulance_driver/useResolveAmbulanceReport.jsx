import { useMutation, useQueryClient } from "@tanstack/react-query";

const resolveAmbulanceReport = async ({ report_id }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ambulance_driver/resolve_report/${report_id}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to resolve report.");
  }

  return json;
};

export const useResolveAmbulanceReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveAmbulanceReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambulance-offered-reports"] });
      queryClient.invalidateQueries({ queryKey: ["ambulance-accepted-reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-by-id"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      queryClient.invalidateQueries({ queryKey: ["active-reports"] });
    },
  });
};