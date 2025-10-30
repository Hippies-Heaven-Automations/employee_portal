import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request): Promise<Response> => {
  // ✅ Allow public calls (no Authorization required)
  // Handle preflight CORS
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
    const { name, email, tempPassword } = await req.json();

    if (!email || !name || !tempPassword) {
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

    // ✉️ Construct welcome email
    const payload = {
      sender: {
        name: "Hippies Heaven Gift Shop",
        email: "hippiesautomation@gmail.com",
      },
      to: [{ email, name }],
      subject: "Welcome to Hippies Heaven Employee Portal 🌿",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;background:#f7fdf7;padding:20px;border-radius:8px;">
          <h2 style="color:#15803d;">🌿 Welcome, ${name}!</h2>
          <p>Your employee account has been created for the <b>Hippies Heaven Employee Portal</b>.</p>
          <p>Login here: <a href="https://employee-portal-self.vercel.app/login" style="color:#15803d;font-weight:bold;">Employee Portal</a></p>
          <p><b>Temporary Password:</b> ${tempPassword}</p>
          <p>Please change your password immediately after your first login.</p>
          <hr style="margin:20px 0;border:none;border-top:1px solid #ccc;" />
          <p style="font-size:13px;color:#555;">Peace, love, and good vibes 🌸,<br>The Hippies Heaven Team</p>
        </div>
      `,
    };

    // 🔗 Send via Brevo
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    return new Response(JSON.stringify({ success: true, result: data }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Error sending email:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email", details: String(err) }),
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
