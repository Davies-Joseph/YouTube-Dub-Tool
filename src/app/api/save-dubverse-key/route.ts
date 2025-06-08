import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "../../../../supabase/server-component";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    const supabase = await createServerComponentClient();

    console.log("API endpoint called with:", {
      apiKey: apiKey ? "[REDACTED]" : "null",
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User authentication error:", userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    if (!apiKey || apiKey.trim() === "") {
      console.error("API key is empty or null");
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    console.log("Updating API key for user:", user.id);

    // First, check if user exists in the users table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking user existence:", fetchError);
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 },
      );
    }

    let updateError;

    if (!existingUser) {
      // User doesn't exist in users table, create them first
      console.log("User not found in users table, creating...");
      const { error: insertError } = await supabase.from("users").insert({
        user_id: user.id,
        email: user.email,
        token_identifier: user.email || user.id,
        dubverse_api_key: apiKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      updateError = insertError;
    } else {
      // User exists, update their API key
      console.log("User found, updating API key...");
      const { error } = await supabase
        .from("users")
        .update({
          dubverse_api_key: apiKey,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      updateError = error;
    }

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: `Failed to update API key: ${updateError.message}` },
        { status: 500 },
      );
    }

    console.log("API key updated successfully");
    return NextResponse.json({
      success: true,
      message: "API key saved successfully",
    });
  } catch (error) {
    console.error("Unexpected error in save-dubverse-key:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
