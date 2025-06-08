import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { InfoIcon, UserCircle, Key, ExternalLink } from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { getDubverseApiKey, updateDubverseApiKey } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const currentApiKey = await getDubverseApiKey();

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                This is a protected page only visible to authenticated users
              </span>
            </div>
          </header>

          {/* API Key Management Section */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Key className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Dubverse API Configuration</CardTitle>
                    <CardDescription>
                      Configure your Dubverse API key for video dubbing
                      functionality
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        Need help with the API?
                      </p>
                      <p className="mb-2">
                        Check out the Dubverse documentation for detailed
                        integration guides.
                      </p>
                      <Link
                        href="https://docs.dubverse.ai/introduction"
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Documentation <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <form action={updateDubverseApiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api_key">Dubverse API Key</Label>
                    <Input
                      id="api_key"
                      name="api_key"
                      type="password"
                      placeholder="Enter your Dubverse API key"
                      defaultValue={currentApiKey || ""}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is stored securely and encrypted in our
                      database.
                    </p>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    {currentApiKey ? "Update API Key" : "Save API Key"}
                  </Button>
                </form>

                {currentApiKey && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        API Key Configured
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Your Dubverse API key is active and ready to use.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
