export const handle_send_sms = async (to, message) => {
  try {
    const request = await fetch("https://auth.nestsms.com/api/v1/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NESTSMS_API_KEY}`,
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });
    const response = await request.json();

    console.log("SMS API Response:", response);

    if (response.code === "ORG_REACTIVATED") {
      const re_request = await fetch(
        "https://auth.nestsms.com/api/v1/sms/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NESTSMS_API_KEY}`,
          },
          body: JSON.stringify({
            to,
            message,
          }),
        },
      );
      const re_response = await re_request.json();
      console.log("Reactivation SMS API Response:", re_response);
      if (!re_response.success) {
        throw new Error(
          re_response.message ||
            "Unknown error occurred while sending SMS after reactivation",
        );
      }
      return re_response;
    }

    if (!response.success) {
      throw new Error(
        response.message || "Unknown error occurred while sending SMS",
      );
    }

    return response;
  } catch (err) {
    throw new Error("Failed to send SMS: " + err.message);
  }
};
