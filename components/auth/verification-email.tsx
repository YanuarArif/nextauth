'use client'

import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FiMail, FiClock, FiLoader, FiCheckCircle, FiXCircle, FiCopy } from "react-icons/fi"
import Link from "next/link"
import { useToast } from "@/components/hooks/use-toast"
import { validateToken } from "@/actions/verify-token"
import { getUserByEmail } from "@/data/user"
import { resendVerificationEmail } from "@/lib/email"

const VerificationEmail = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { toast } = useToast()

  const [countdown, setCountdown] = useState(30)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token is missing")
        return
      }

      try {
        setVerifying(true)
        // Get the verification token first to get the email
        const result = await validateToken(token)
        setSuccess("Email verified successfully!")
        setEmail(result.email)
        // Optional: Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Verification failed")
      } finally {
        setVerifying(false)
      }
    }

    if (token) {
      verifyToken()
    }
  }, [token, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onResendEmail = useCallback(async () => {
    if (!email) return

    try {
      setCountdown(30)
      // TODO: Add resend email functionality
      toast({
        title: "Verification email sent",
        description: "Please check your inbox",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      })
    }
  }, [email, toast])

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email)
      toast({
        title: "Email copied to clipboard",
      })
    }
  }

  return (
    <div className="flex min-h-[600px] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {verifying && (
              <FiLoader className="h-6 w-6 text-blue-600 animate-spin" />
            )}
            {success && (
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            )}
            {error && (
              <FiXCircle className="h-6 w-6 text-red-600" />
            )}
            {!verifying && !success && !error && (
              <FiMail className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {verifying && "Verifying your email..."}
            {success && "Email verified!"}
            {error && "Verification failed"}
            {!verifying && !success && !error && "Check your email"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {!verifying && !success && !error && "We sent you a verification link. Please check your email."}
            {error && (
              <span className="text-red-500">{error}</span>
            )}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {email && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-3">
              <FiMail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{email}</span>
              <button
                onClick={copyToClipboard}
                className="ml-2 text-blue-600 hover:text-blue-700"
              >
                <FiCopy className="h-4 w-4" />
              </button>
            </div>
          )}

          {!success && (
            <Button
              onClick={onResendEmail}
              disabled={countdown > 0}
              className="w-full gap-2"
              variant="outline"
            >
              {countdown > 0 ? (
                <>
                  <FiClock className="h-4 w-4" />
                  Resend in {countdown}s
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          )}

          {success && (
            <Button asChild className="w-full">
              <Link href="/login">Continue to Login</Link>
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <p className="text-muted-foreground">
            Having trouble?{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiMail className="inline mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VerificationEmail