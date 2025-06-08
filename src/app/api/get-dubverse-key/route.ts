import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "../../../../supabase/server-component";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("dubverse_api_key")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching API key:", error);
      return NextResponse.json({ apiKey: null });
    }

    return NextResponse.json({ apiKey: data?.dubverse_api_key || null });
  } catch (error) {
    console.error("Unexpected error in get-dubverse-key:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
