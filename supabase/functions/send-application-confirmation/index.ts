import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle browser preflight
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
    const { name, email, jobTitle } = await req.json();

    if (!email || !name) {
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

    const payload = {
      sender: {
        name: "Hippies Heaven Gift Shop",
        email: "hippiesautomation@gmail.com",
      },
      to: [{ email, name }],
      subject: `We received your application${
        jobTitle ? ` for ${jobTitle}` : ""
      }!`,
      htmlContent: `
        <div style="font-family:Arial, sans-serif; background:#f7fdf7; padding:20px; border-radius:8px;">
          <h2 style="color:#1b4332;">🌿 Hippies Heaven Gift Shop</h2>
          <p>Hi ${name},</p>
          <p>Thank you for submitting your application${
            jobTitle ? ` for the <b>${jobTitle}</b> position` : ""
          }.</p>
          <p>Our team has received your details and will review them soon.<br>
          If shortlisted, you’ll receive another email to schedule your interview.</p>
          <p style="margin-top:20px;">Peace, love, and good vibes 🌸,<br><b>The Hippies Heaven Team</b></p>
          <p style="margin-top:30px; font-size:13px; color:#666;">
            ✉️ <em>Please do not reply to this email.</em><br />
            This inbox is not monitored. For questions or updates about your application,
            contact us at <a href="mailto:hippiesheavengiftshop@gmail.com">hippiesheavengiftshop@gmail.com</a>.
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
        message: `Confirmation email sent to ${email}`,
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
