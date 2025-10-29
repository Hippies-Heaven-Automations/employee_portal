export async function sendConfirmationEmail({ name, email, jobTitle }: {
  name: string;
  email: string;
  jobTitle?: string;
}) {
  const res = await fetch(
    "https://vnxftftsglekhpczgbcf.functions.supabase.co/send-application-confirmation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, jobTitle }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(`Email send failed: ${JSON.stringify(data)}`);
  return data;
}
