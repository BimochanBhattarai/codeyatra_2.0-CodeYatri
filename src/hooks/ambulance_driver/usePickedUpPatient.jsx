import { useMutation, useQueryClient } from "@tanstack/react-query";

const pickedUpPatient = async ({ report_id }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/ambulance_driver/picked_up_patient/${report_id}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Failed to mark patient as picked up.");
  }

  return json;
};

export const usePickedUpPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickedUpPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambulance-offered-reports"] });
      queryClient.invalidateQueries({ queryKey: ["ambulance-accepted-reports"] });
      queryClient.invalidateQueries({ queryKey: ["report-by-id"] });
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      queryClient.invalidateQueries({ queryKey: ["active-reports"] });
    },
  });
};