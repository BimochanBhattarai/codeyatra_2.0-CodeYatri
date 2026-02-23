import { useMutation } from "@tanstack/react-query";

export const useUpdateGlobals = () => {
  return useMutation({
    mutationFn: async ({ police_mobile_alerts }) => {
      const response = await fetch("/api/global/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          police_mobile_alerts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update global settings.");
      }

      const data = await response.json();
      return data.data;
    },
  });
};
