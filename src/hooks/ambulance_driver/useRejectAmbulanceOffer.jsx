import { useMutation } from "@tanstack/react-query";

export const useRejectAmbulanceOffer = () => {
  return useMutation({
    mutationFn: async ({ report_id }) => {
      const response = await fetch(
        `/api/report/reject_ambulance_offer/${report_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject ambulance offer.");
      }

      return response.json();
    },
  });
};
