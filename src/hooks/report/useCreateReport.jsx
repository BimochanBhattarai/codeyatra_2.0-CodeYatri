import { useMutation } from "@tanstack/react-query";

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async ({
      location,
      estimated_number_of_casualties,
      incident_type,
      description,
      phone_number,
      photos,
    }) => {
      const formData = new FormData();

      formData.append("location", JSON.stringify(location));
      formData.append(
        "estimated_number_of_casualties",
        estimated_number_of_casualties,
      );
      formData.append("incident_type", incident_type);
      formData.append("description", description);
      formData.append("phone_number", phone_number);
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await fetch("/api/report/add", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create report.");
      }

      return response.json();
    },
  });
};
