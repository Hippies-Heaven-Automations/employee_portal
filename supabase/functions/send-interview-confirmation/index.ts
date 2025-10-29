import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request): Promise<Response> => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const { name, email, jobTitle, interviewTime } = await req.json();

    if (!email || !name || !interviewTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) throw new Error("BREVO_API_KEY not found in secrets");

    // ✅ Format interview time to Central Time
    const formattedTime = new Date(interviewTime).toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const payload = {
      sender: {
        name: "Hippies Heaven Gift Shop",
        email: "hippiesautomation@gmail.com",
      },
      to: [{ email, name }],
      subject: `Interview Scheduled for ${jobTitle || "your application"} 🌿`,
      htmlContent: `
        <div style="font-family:Arial, sans-serif; background:#f7fdf7; padding:20px; border-radius:8px;">
          <h2 style="color:#1b4332;">🌿 Hippies Heaven Gift Shop</h2>
          <p>Hi ${name},</p>
          <p>Your interview for the <b>${jobTitle}</b> position has been scheduled.</p>
          <p><b>Date & Time:</b> ${formattedTime} (Central Time)</p>
          <p>Please reply to confirm your availability, or contact us if rescheduling is needed.</p>
          <p style="margin-top:20px;">Peace, love, and good vibes 🌸,<br><b>The Hippies Heaven Team</b></p>
          <p style="margin-top:30px; font-size:13px; color:#666;">
            ✉️ <em>Please do not reply to this email.</em><br />
            For questions, contact <a href="mailto:hippiesheavengiftshop@gmail.com">hippiesheavengiftshop@gmail.com</a>.
          </p>
        </div>
      `,
    };

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const brevoData = await brevoRes.json();
    if (!brevoRes.ok) {
      throw new Error(JSON.stringify(brevoData));
    }

    return new Response(
      JSON.stringify({
        message: `Interview email sent to ${email}`,
        brevo: brevoData,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Error sending email:", err);

    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: String(err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
