import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="px-4 py-6 sm:px-6 lg:px-8 pt-16 lg:pt-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
