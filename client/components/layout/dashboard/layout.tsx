import Sidebar from "@/components/features/dashboard/side-bar/side-bar";
import TopBar from "@/components/features/dashboard/top-bar/top-bar";

/**
 * DashboardLayout
 * Route group: /[locale]/(dashboard)
 * Renders the fixed sidebard + sticky topbar, and centres the main content area
 */
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-surface text-on-surface antialiased">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;