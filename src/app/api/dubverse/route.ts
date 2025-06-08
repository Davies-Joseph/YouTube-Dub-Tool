import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's API key from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("dubverse_api_key")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.dubverse_api_key) {
      return NextResponse.json(
        {
          error:
            "Dubverse API key not configured. Please add your API key in the dashboard.",
        },
        { status: 400 },
      );
    }

    // Get the request body and endpoint from the client
    const {
      endpoint,
      method = "POST",
      body: requestBody,
    } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 },
      );
    }

    // Make the request to Dubverse API
    const dubverseUrl = `https://api.dubverse.ai${endpoint}`;

    const response = await fetch(dubverseUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.dubverse_api_key}`,
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Dubverse API error", details: responseData },
        { status: response.status },
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dubverse API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's API key from the database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("dubverse_api_key")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.dubverse_api_key) {
      return NextResponse.json(
        {
          error:
            "Dubverse API key not configured. Please add your API key in the dashboard.",
        },
        { status: 400 },
      );
    }

    // Get the endpoint from query parameters
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 },
      );
    }

    // Make the request to Dubverse API
    const dubverseUrl = `https://api.dubverse.ai${endpoint}`;

    const response = await fetch(dubverseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.dubverse_api_key}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Dubverse API error", details: responseData },
        { status: response.status },
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Dubverse API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
