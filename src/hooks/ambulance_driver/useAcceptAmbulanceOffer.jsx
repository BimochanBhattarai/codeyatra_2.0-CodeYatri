import { useMutation } from "@tanstack/react-query";

export const useAcceptAmbulanceOffer = () => {
  return useMutation({
    mutationFn: async ({ report_id, response_location }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ambulance_driver/accept_offer/${report_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ response_location }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to accept ambulance offer.");
      }

      return response.json();
    },
  });
};
