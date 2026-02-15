"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="max-w-md w-full rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <h1 className="text-lg font-bold tracking-tight">RevPool</h1>
      </div>
      <p className="text-sm text-gray-400 mb-8">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-200">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 font-semibold shadow-sm w-full text-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
