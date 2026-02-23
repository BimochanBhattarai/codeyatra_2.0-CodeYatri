import { useMutation } from "@tanstack/react-query";

export const useSubmitAmbulanceDriverApplication = () => {
  return useMutation({
    mutationFn: async ({
      driver_photo,
      full_name,
      phone_number,
      nid_number,
      experience_years,
      working_area,
      ambulance_type,
      vehicle_number,
      vehicle_model,
      vehicle_year,
      hospital_name,
      hospital_phone,
      license_number,
      license_expiry,
      license_front,
      license_back,
      bluebook_number,
      bluebook_expiry,
      bluebook_photo,
    }) => {
      const formData = new FormData();

      formData.append("driver_photo", driver_photo);
      formData.append("full_name", full_name);
      formData.append("phone_number", phone_number);
      formData.append("nid_number", nid_number);
      formData.append("experience_years", experience_years);
      formData.append("working_area", JSON.stringify(working_area));
      formData.append("ambulance_type", ambulance_type);
      formData.append("vehicle_number", vehicle_number);
      formData.append("vehicle_model", vehicle_model);
      formData.append("vehicle_year", vehicle_year);
      formData.append("hospital_name", hospital_name);
      formData.append("hospital_phone", hospital_phone);
      formData.append("license_number", license_number);
      formData.append("license_expiry", license_expiry);
      formData.append("license_front", license_front);
      formData.append("license_back", license_back);
      formData.append("bluebook_number", bluebook_number);
      formData.append("bluebook_expiry", bluebook_expiry);
      formData.append("bluebook_photo", bluebook_photo);

      const response = await fetch("/api/ambulance_driver/submit_application", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit ambulance driver application.");
      }

      return response.json();
    },
  });
};
