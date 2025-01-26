"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiMail,
  FiCheck,
  FiX,
  FiLoader,
  FiClock,
  FiCopy,
} from "react-icons/fi";
import { useToast } from "@/components/hooks/use-toast";

export default function SendVerificationEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { toast } = useToast();

  // Handle email verification
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get("token");
        // Simulate API call
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyToken();
  }, [searchParams]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown > 0 && status === "error") {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  const handleResendEmail = async () => {
    setCountdown(30);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast({
        title: "Verification email sent",
        description: "Please check your inbox",
      });
    } catch (error) {
      toast({
        title: "Error resending email",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email || "");
    toast({
      title: "Email copied to clipboard",
    });
  };

  return (
    <div className="shadow-lg">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {status === "loading" && (
              <FiLoader className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            {status === "success" && (
              <FiCheck className="h-6 w-6 text-green-600" />
            )}
            {status === "error" && <FiX className="h-6 w-6 text-red-600" />}
          </div>
          <h1 className="text-2xl font-bold">
            {status === "success" ? "Email Verified!" : "Verify Your Email"}
          </h1>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <p className="text-muted-foreground">
              Verifying your email address...
            </p>
          )}

          {status === "success" && (
            <>
              <p className="text-muted-foreground">
                Your email {email} has been successfully verified.
              </p>
              <Button className="w-full mt-4">Continue to Dashboard</Button>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-muted-foreground">
                The verification link is invalid or has expired.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm">
                <FiMail className="h-4 w-4" />
                <span>{email}</span>
                <button
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FiCopy className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={countdown > 0}
                className="w-full mt-4 gap-2"
              >
                {countdown > 0 ? (
                  <>
                    <FiClock className="h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <p className="text-muted-foreground">
            Need help?{" "}
            <a href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </p>
          <a
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiMail className="inline mr-2 h-4 w-4" />
            Return to Login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
