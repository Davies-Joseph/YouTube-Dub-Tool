"use client";

import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((event: ErrorEvent) => {
    console.error("Caught error:", event.error);
    if (event.error && event.error instanceof Error) {
      setError(event.error);
    } else {
      setError(new Error("Unknown error occurred"));
    }
    event.preventDefault();
  }, []);

  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      let errorToSet: Error;

      try {
        if (event.reason instanceof Error) {
          errorToSet = event.reason;
        } else if (typeof event.reason === "string") {
          errorToSet = new Error(event.reason);
        } else if (
          event.reason &&
          typeof event.reason === "object" &&
          "message" in event.reason &&
          typeof event.reason.message === "string"
        ) {
          errorToSet = new Error(event.reason.message);
        } else {
          errorToSet = new Error("Unknown promise rejection");
        }
      } catch {
        errorToSet = new Error("Error processing promise rejection");
      }

      setError(errorToSet);
      event.preventDefault();
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, [handleError, handleUnhandledRejection]);

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p className="font-mono text-sm mb-2">{error.message}</p>
            <p className="text-xs text-muted-foreground">
              {error.stack?.split("\n").slice(0, 3).join("\n")}
            </p>
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
