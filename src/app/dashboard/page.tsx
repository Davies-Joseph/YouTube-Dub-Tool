import { createServerComponentClient } from "../../../supabase/server-component";
import { redirect } from "next/navigation";
import { getDubverseApiKey, checkUserSubscription } from "../actions";
import DashboardClient from "@/components/dashboard-client";

export default async function Dashboard() {
  const supabase = await createServerComponentClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const currentApiKey = await getDubverseApiKey();
  const isSubscribed = await checkUserSubscription(user.id);

  console.log("Dashboard - User ID:", user.id);
  console.log("Dashboard - Is Subscribed:", isSubscribed);

  return (
    <DashboardClient
      user={user}
      currentApiKey={currentApiKey}
      isSubscribed={isSubscribed}
    />
  );
}
