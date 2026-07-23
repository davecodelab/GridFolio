export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { name, email, message, type } = req.body;

    // Basic Validation
    if (type === "footer") {
      if (!email) {
        return res.status(400).json({ error: "Address/Email is required" });
      }
    } else {
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL;

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY environment variable.");
      return res.status(500).json({ error: "Server configuration error: Missing API Key" });
    }

    if (!toEmail) {
      console.error("Missing CONTACT_RECEIVER_EMAIL environment variable.");
      return res.status(500).json({ error: "Server configuration error: Missing Receiver Email" });
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || "Rare Devs Studio <notifications@mail.raredevs.tech>";

    // Prepare email payload
    const emailBody = type === "footer"
      ? {
          from: fromAddress,
          to: toEmail,
          subject: "New Signal Transmission (Footer Form)",
          html: `
            <div style="font-family: monospace; background-color: #141414; color: #f2eeda; padding: 20px; border: 1px solid #262626; border-radius: 8px;">
              <h2 style="color: #ee6436; border-bottom: 1px dashed #ee6436; padding-bottom: 10px;">[ FOOTER TRANSMISSION SIGNAL ]</h2>
              <p><strong>Channel address / Email:</strong> ${email}</p>
              <p style="color: #8c8a7f; font-size: 12px; margin-top: 20px; border-top: 1px solid #262626; padding-top: 10px;">Received from Rare Devs Site Footer Form</p>
            </div>
          `,
        }
      : {
          from: fromAddress,
          to: toEmail,
          subject: `New Transmission from ${name}`,
          html: `
            <div style="font-family: monospace; background-color: #141414; color: #f2eeda; padding: 20px; border: 1px solid #262626; border-radius: 8px;">
              <h2 style="color: #ee6436; border-bottom: 1px dashed #ee6436; padding-bottom: 10px;">[ CONTACT TRANSMISSION SIGNAL ]</h2>
              <p><strong>Name / Callsign:</strong> ${name}</p>
              <p><strong>Return Address / Email:</strong> ${email}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #262626; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap;"><strong>Message Body:</strong></p>
                <p style="margin: 10px 0 0 0; color: #f2eeda;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="color: #8c8a7f; font-size: 12px; margin-top: 20px; border-top: 1px solid #262626; padding-top: 10px;">Received from Rare Devs Site Contact Form</p>
            </div>
          `,
        };

    // Dispatch request to Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API response failure:", data);
      return res.status(response.status).json({ error: data.message || "Failed to dispatch email via Resend API" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Handler error sending email:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
