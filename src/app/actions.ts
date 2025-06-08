"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createServerActionClient } from "../../supabase/server-actions";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createServerActionClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // User record is automatically created by database trigger
  // No manual insertion needed

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string;
  const supabase = await createServerActionClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect(redirectTo || "/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createServerActionClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createServerActionClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createServerActionClient();

  try {
    console.log("Checking subscription for user:", userId);

    // Get user email for development bypass
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Temporary bypass for development - allow access for specific email
    if (user?.email === "daviesjoseph449@gmail.com") {
      console.log(
        "Development bypass: Allowing access for daviesjoseph449@gmail.com",
      );
      return true;
    }

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Subscription check error:", error);
      return false;
    }

    console.log("Found subscriptions:", subscriptions);

    // Check if user has any active, trialing, or incomplete subscriptions
    const activeSubscription = subscriptions?.find(
      (sub) =>
        sub.status === "active" ||
        sub.status === "trialing" ||
        sub.status === "incomplete" ||
        (sub.status === "past_due" &&
          sub.current_period_end &&
          sub.current_period_end * 1000 > Date.now()),
    );

    console.log("Active subscription found:", !!activeSubscription);
    if (activeSubscription) {
      console.log("Subscription details:", activeSubscription);
    }

    return !!activeSubscription;
  } catch (error) {
    console.error("Subscription check failed:", error);
    return false;
  }
};

export const updateDubverseApiKey = async (formData: FormData) => {
  const apiKey = formData.get("api_key")?.toString();
  const supabase = await createServerActionClient();

  console.log("updateDubverseApiKey called with:", {
    apiKey: apiKey ? "[REDACTED]" : "null",
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User authentication error:", userError);
    return encodedRedirect("error", "/dashboard", "User not authenticated");
  }

  if (!apiKey || apiKey.trim() === "") {
    console.error("API key is empty or null");
    return encodedRedirect("error", "/dashboard", "API key is required");
  }

  console.log("Updating API key for user:", user.id);

  try {
    // First, check if user exists in the users table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking user existence:", fetchError);
      return encodedRedirect("error", "/dashboard", "Database error occurred");
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
      return encodedRedirect(
        "error",
        "/dashboard",
        `Failed to update API key: ${updateError.message}`,
      );
    }

    console.log("API key updated successfully");
    return encodedRedirect(
      "success",
      "/dashboard",
      "API key updated successfully",
    );
  } catch (error) {
    console.error("Unexpected error in updateDubverseApiKey:", error);
    return encodedRedirect(
      "error",
      "/dashboard",
      "An unexpected error occurred while updating the API key",
    );
  }
};

export const getDubverseApiKey = async () => {
  const supabase = await createServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("dubverse_api_key")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data?.dubverse_api_key || null;
};
