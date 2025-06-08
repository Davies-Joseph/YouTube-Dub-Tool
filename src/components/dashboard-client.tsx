"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  InfoIcon,
  UserCircle,
  Key,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// Dynamically import the YouTube dubbing tool to avoid SSR issues
const YouTubeDubbingTool = dynamic(
  () => import("@/components/youtube-dubbing-tool"),
  { ssr: false },
);

interface DashboardClientProps {
  user: any;
  currentApiKey: string | null;
  isSubscribed: boolean;
}

export default function DashboardClient({
  user,
  currentApiKey,
  isSubscribed,
}: DashboardClientProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const handleSaveApiKey = useCallback(async () => {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    setSaveStatus("");

    try {
      const response = await fetch("/api/save-dubverse-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (response.ok) {
        setSaveStatus("API key saved successfully!");
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }, 1000);
      } else {
        const data = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        setSaveStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("API key save error:", error);
      setSaveStatus("Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  }, [apiKey]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Show YouTube Dubbing Tool for subscribed users */}
          {isSubscribed ? (
            <>
              {/* Header Section */}
              <header className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">
                  YouTube Dubbing Dashboard
                </h1>
                <div className="bg-green-50 border border-green-200 text-sm p-3 px-4 rounded-lg text-green-800 flex gap-2 items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>
                    Welcome! Your subscription is active. Start dubbing YouTube
                    videos below.
                  </span>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="bg-blue-50 border border-blue-200 text-sm p-3 px-4 rounded-lg text-blue-800">
                    <p>Debug Info:</p>
                    <p>User ID: {user.id}</p>
                    <p>
                      Subscription Status:{" "}
                      {isSubscribed ? "Active" : "Inactive"}
                    </p>
                  </div>
                )}
              </header>

              {/* YouTube Dubbing Tool */}
              <YouTubeDubbingTool />

              {/* API Key Management Section - Collapsible */}
              <section>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Key className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle>Dubverse API Configuration</CardTitle>
                        <CardDescription>
                          {currentApiKey
                            ? "Your API key is configured and ready to use"
                            : "Configure your Dubverse API key for enhanced dubbing functionality"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!currentApiKey && (
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
                              View Documentation{" "}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="api_key_subscribed">
                          Dubverse API Key
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="api_key_subscribed"
                            type="password"
                            placeholder="Enter your Dubverse API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="font-mono flex-1"
                          />
                          <Button
                            onClick={handleSaveApiKey}
                            disabled={isSaving || !apiKey.trim()}
                            className="min-w-[120px]"
                          >
                            {isSaving
                              ? "Saving..."
                              : currentApiKey
                                ? "Update API Key"
                                : "Save API Key"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your API key is stored securely and encrypted in our
                          database.
                        </p>
                        {saveStatus && (
                          <div
                            className={`p-2 rounded text-sm ${
                              saveStatus.includes("Error") ||
                              saveStatus.includes("Failed")
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-green-50 text-green-800 border border-green-200"
                            }`}
                          >
                            {saveStatus}
                          </div>
                        )}
                      </div>
                    </div>

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
            </>
          ) : (
            <>
              {/* Non-subscribed users */}
              <header className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Subscription Required:</strong> You need an active
                    subscription to access the YouTube dubbing tool.
                    <Link
                      href="/pricing"
                      className="underline font-medium ml-1"
                    >
                      View pricing plans
                    </Link>
                  </AlertDescription>
                </Alert>
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
                            View Documentation{" "}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="api_key_non_subscribed">
                          Dubverse API Key
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="api_key_non_subscribed"
                            type="password"
                            placeholder="Enter your Dubverse API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="font-mono flex-1"
                          />
                          <Button
                            onClick={handleSaveApiKey}
                            disabled={isSaving || !apiKey.trim()}
                            className="min-w-[120px]"
                          >
                            {isSaving
                              ? "Saving..."
                              : currentApiKey
                                ? "Update API Key"
                                : "Save API Key"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your API key is stored securely and encrypted in our
                          database.
                        </p>
                        {saveStatus && (
                          <div
                            className={`p-2 rounded text-sm ${
                              saveStatus.includes("Error") ||
                              saveStatus.includes("Failed")
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-green-50 text-green-800 border border-green-200"
                            }`}
                          >
                            {saveStatus}
                          </div>
                        )}
                      </div>
                    </div>

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
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
                  <pre className="text-xs font-mono max-h-48 overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
