export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Profile</h2>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Display Name</label>
              <input
                type="text"
                defaultValue="Camden Jauert"
                className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Email</label>
              <input
                type="email"
                defaultValue="camden@revpool.io"
                className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Notifications</h2>
          <p className="text-gray-500 text-sm">Notification preferences coming soon.</p>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight mb-4 text-red-600">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="border border-red-300 text-red-600 hover:bg-red-50 transition px-4 py-2 rounded-lg text-sm font-medium">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
