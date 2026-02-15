"use client";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";
  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
  const roleLabel = role === "manager" ? "Manager" : "Sales Rep";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Display Name</label>
              <input
                type="text"
                defaultValue={userName}
                className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                defaultValue={userEmail}
                className="bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 h-10 text-sm w-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 h-10 flex items-center">
                {roleLabel}
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 font-semibold shadow-sm mt-4 w-fit text-sm">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Notifications</h2>
          <p className="text-gray-500 text-sm">Notification preferences coming soon.</p>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-gray-900 mb-4 text-red-600">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
