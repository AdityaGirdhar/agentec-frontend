import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const tokenUrl = "https://github.com/login/oauth/access_token";
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
  });

  try {
    const tokenRes = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
    }

    return NextResponse.json(tokenData);
  } catch (error) {
    return NextResponse.json({ error: `Internal server error ${error}` }, { status: 500 });
  }
}
