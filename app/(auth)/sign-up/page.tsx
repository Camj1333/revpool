"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ParticipantOption {
  id: number;
  name: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"rep" | "manager">("rep");
  const [participantId, setParticipantId] = useState<string>("");
  const [participants, setParticipants] = useState<ParticipantOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/participants")
      .then((r) => r.json())
      .then(setParticipants)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        participantId: role === "rep" && participantId ? Number(participantId) : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
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
      <p className="text-sm text-gray-400 mb-8">Create your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>

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
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Confirm your password"
          />
        </div>

        {/* Role selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Role</label>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setRole("rep")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                role === "rep"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sales Rep
            </button>
            <button
              type="button"
              onClick={() => setRole("manager")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                role === "manager"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Manager
            </button>
          </div>
        </div>

        {/* Participant dropdown for reps */}
        {role === "rep" && participants.length > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Link to Participant <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select a participant...</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 font-semibold shadow-sm w-full text-sm"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
