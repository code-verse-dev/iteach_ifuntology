import * as React from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";

export default function DashboardWithSidebarLayout({ children }: { children: React.ReactNode }) {
  useNotificationRealtime();
  return (
    <div className="bg-app min-h-screen">
      <SidebarProvider defaultOpen>
        <div className="w-full min-h-screen">
          <DashboardSidebar />
          <SidebarInset>
            <Topbar />
            <div className="min-h-[calc(100vh-3.5rem)] w-full px-4 pb-10 sm:px-6">
              <main className="w-full py-8">{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
