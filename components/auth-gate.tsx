"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Mode = "signin" | "signup"

type OAuthProviders = { google: boolean; apple: boolean }

export function AuthGate() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauth, setOauth] = useState<OAuthProviders>({ google: false, apple: false })

  useEffect(() => {
    fetch("/api/auth/oauth-enabled")
      .then((res) => res.json())
      .then((data: OAuthProviders) => setOauth(data))
      .catch(() => {})
  }, [])

  const handleOAuth = (provider: "google" | "apple") => {
    setError("")
    signIn(provider, { callbackUrl: "/" })
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/",
      })
      if (res?.error) {
        setError("Invalid email or password.")
        return
      }
      if (res?.ok) window.location.href = "/"
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !password) {
      setError("Email and password are required.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Sign up failed.")
        return
      }
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/",
      })
      if (signInRes?.ok) window.location.href = "/"
      else setError("Account created. Please sign in.")
    } finally {
      setLoading(false)
    }
  }

  const isSignIn = mode === "signin"

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border bg-card shadow-md">
        <CardContent className="p-6 pt-6">
          <h2 className="text-xl font-semibold text-foreground text-center mb-5">
            {isSignIn ? "Sign in to Clearmed" : "Create your account"}
          </h2>

          {/* OAuth – only show when configured */}
          {(oauth.google || oauth.apple) && (
            <div className="space-y-3 mb-5">
              {oauth.google && (
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              )}
              {oauth.apple && (
                <button
                  type="button"
                  onClick={() => handleOAuth("apple")}
                  className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </button>
              )}
            </div>
          )}

          {(oauth.google || oauth.apple) && (
          <div className="relative my-5">
            <span className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </span>
            <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
              Or
            </span>
          </div>
          )}

          {/* Email / password form */}
          <form
            onSubmit={isSignIn ? handleCredentialsSignIn : handleSignUp}
            className="space-y-4"
          >
            {!isSignIn && (
              <div>
                <label htmlFor="auth-name" className="sr-only">
                  Name (optional)
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="sr-only">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                  "w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="sr-only">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                placeholder={isSignIn ? "Password" : "Password (min 8 characters)"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignIn ? undefined : 8}
                className={cn(
                  "w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                )}
                autoComplete={isSignIn ? "current-password" : "new-password"}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? "Please wait…" : isSignIn ? "Sign in to Clearmed" : "Create account"}
            </button>
          </form>

          {/* Toggle sign in / sign up */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignIn ? (
              <>
                New to Clearmed?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-primary hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
