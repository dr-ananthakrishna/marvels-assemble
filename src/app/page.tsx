import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-indigo-900">Marvels Assemble ⚡</h1>
          <p className="text-gray-600">The college ambassador platform. Join your campus Marvel network.</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="w-full py-3 px-6 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Apply to be a Marvel
          </Link>
        </div>
      </div>
    </main>
  );
}
