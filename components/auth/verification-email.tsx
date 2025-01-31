// app/verify-email/page.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiMail,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";

export default function VerificationEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [countdown, setCountdown] = useState(30);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

    if (token) verifyEmail();
    else setStatus("error");
  }, [token]);

  useEffect(() => {
    if (status === "error" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, status]);

  const handleResend = async () => {
    setCountdown(30);
    try {
      await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error("Gagal mengirim ulang email:", error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {status === "loading" && (
              <FiLoader className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            {status === "success" && (
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            )}
            {status === "error" && (
              <FiXCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {status === "success" ? "Verifikasi Berhasil!" : "Verifikasi Email"}
          </h1>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <Alert>
              <AlertDescription>
                Sedang memverifikasi email Anda...
              </AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  Email {email} berhasil diverifikasi!
                </AlertDescription>
              </Alert>
              <Button className="w-full gap-2" asChild>
                <Link href="/dashboard">
                  Lanjut ke Dashboard
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {!token
                    ? "Token tidak valid"
                    : "Token sudah kadaluarsa atau tidak valid"}
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <FiMail className="h-4 w-4" />
                <span>{email}</span>
              </div>

              <Button
                onClick={handleResend}
                disabled={countdown > 0}
                className="w-full gap-2"
                variant="outline"
              >
                {countdown > 0 ? (
                  <>
                    <FiClock className="h-4 w-4" />
                    Kirim ulang dalam {countdown} detik
                  </>
                ) : (
                  "Kirim Ulang Verifikasi Email"
                )}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <p className="text-muted-foreground">
            Masih ada masalah?{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Hubungi Support
            </Link>
          </p>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <FiArrowRight className="h-4 w-4" />
            Kembali ke Halaman Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
