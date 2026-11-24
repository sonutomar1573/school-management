import LogoutButton from "@/components/LogoutButton";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-purple-600">SchoolChalo</h1>
          <p className="text-xs text-gray-500">Parent Portal</p>
        </div>
        <div className="w-32">
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
