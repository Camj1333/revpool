export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center">
      {children}
    </div>
  );
}
