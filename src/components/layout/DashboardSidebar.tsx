import { ComponentType } from "react";
import {
  Award,
  Bell,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListChecks,
  MessagesSquare,
  UserCog,
  Users,
  Video,
} from "lucide-react";
import { useSelector } from "react-redux";
import BrandLogo from "@/components/branding/BrandLogo";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserRole } from "@/constants/roles";
import { RootState } from "@/redux/store";
import { ImageUrl } from "@/utils/Functions";

type Item = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
};

const navByRole: Record<UserRole, { label: string; items: Item[] }[]> = {
  admin: [
    {
      label: "Main",
      items: [{ title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "People",
      items: [
        { title: "Teachers", url: "/admin/teachers", icon: Users },
        { title: "Students", url: "/admin/students", icon: GraduationCap },
      ],
    },
    {
      label: "Learning",
      items: [
        { title: "LMS Management", url: "/admin/lms-management", icon: GraduationCap },
        { title: "Module Management", url: "/admin/module-management", icon: Library },
        { title: "Quiz Management", url: "/admin/quiz-management", icon: ListChecks },
        { title: "Video Library", url: "/admin/video-library-management", icon: Video },
        { title: "Surveys", url: "/admin/surveys-evaluations", icon: FileText },
      ],
    },
    {
      label: "Workspace",
      items: [
        { title: "Chat", url: "/admin/messages", icon: MessagesSquare },
        { title: "Notifications", url: "/admin/notifications", icon: Bell },
        { title: "Profile", url: "/admin/my-profile", icon: UserCog },
      ],
    },
  ],
  teacher: [
    {
      label: "Main",
      items: [{ title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Learning",
      items: [
        { title: "My Courses", url: "/teacher/my-courses", icon: BookOpen },
        { title: "My Students", url: "/teacher/my-students", icon: Users },
        { title: "Video Library", url: "/teacher/video-library", icon: Video },
        { title: "Surveys", url: "/teacher/surveys", icon: FileText },
      ],
    },
    {
      label: "Workspace",
      items: [
        { title: "Chat", url: "/teacher/messages", icon: MessagesSquare },
        { title: "Notifications", url: "/teacher/notifications", icon: Bell },
        { title: "Profile", url: "/teacher/my-profile", icon: UserCog },
      ],
    },
  ],
  student: [
    {
      label: "Main",
      items: [{ title: "Dashboard", url: "/student/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Learning",
      items: [
        { title: "Learning", url: "/student/learning", icon: BookOpen },
        { title: "Certificates", url: "/student/certificates", icon: Award },
        { title: "Video Library", url: "/student/video-library", icon: Video },
        { title: "Surveys", url: "/student/surveys", icon: FileText },
      ],
    },
    {
      label: "Workspace",
      items: [
        { title: "Chat", url: "/student/messages", icon: MessagesSquare },
        { title: "Notifications", url: "/student/notifications", icon: Bell },
        { title: "Profile", url: "/student/my-profile", icon: UserCog },
      ],
    },
  ],
};

function MenuLink({ item }: { item: Item }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <SidebarMenuButton asChild tooltip={item.title}>
      <NavLink
        to={item.url}
        className="w-full"
        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      >
        <item.icon className="h-4 w-4" />
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    </SidebarMenuButton>
  );
}

export default function DashboardSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const user = useSelector((state: RootState) => state.user.userData);
  const role: UserRole = user?.role ?? "student";
  const items = navByRole[role].flatMap((group) => group.items);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-white">
      <SidebarHeader className="p-3">
        <div className={`flex items-center rounded-2xl ${collapsed ? "justify-center" : "px-1"}`}>
          {collapsed ? (
            <img src={ImageUrl("logo.png")} alt="iTeach iFuntology" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <BrandLogo size="medium" withWordmark />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <MenuLink item={item} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-border"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
