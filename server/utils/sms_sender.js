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
