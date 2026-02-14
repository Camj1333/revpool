export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Profile</h2>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Display Name</label>
              <input
                type="text"
                defaultValue="Camden Jauert"
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                defaultValue="camden@revpool.io"
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Notifications</h2>
          <p className="text-gray-400 text-sm">Notification preferences coming soon.</p>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-900 border border-red-900/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold tracking-tight mb-4 text-red-400">Danger Zone</h2>
          <p className="text-gray-400 text-sm mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="border border-red-800 text-red-400 hover:bg-red-900/30 transition px-4 py-2 rounded-lg text-sm font-medium">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
