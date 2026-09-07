import { Bell, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger, useSidebarOptional } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogoutMutation } from "@/redux/services/apiSlices/authSlice";
import { useGetNotificationsQuery } from "@/redux/services/apiSlices/notificationSlice";
import { removeUser } from "@/redux/services/Slices/userSlice";
import { RootState } from "@/redux/store";
import { ROLE_HOME, UserRole } from "@/constants/roles";
import { initials } from "@/utils/Functions";

export default function Topbar() {
  const navigate = useNavigate();
  const sidebar = useSidebarOptional();
  const [logout] = useLogoutMutation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const user = useSelector((state: RootState) => state?.user?.userData);
  const dispatch = useDispatch();
  const role: UserRole = user?.role ?? "student";
  const { data } = useGetNotificationsQuery({ role, page: 1, limit: 1 });
  const unreadCount: number = data?.data?.unreadCount ?? 0;

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Still clear the local session if the API call fails.
    }
    dispatch(removeUser());
    setLogoutDialogOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          {sidebar && (
            <SidebarTrigger className="h-10 w-10 rounded-full border border-border bg-background" />
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">iTeach iFuntology</p>
            <p className="text-sm text-muted-foreground capitalize">{role} workspace</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border border-border" asChild>
            <Link to={`/${role}/notifications`} aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 rounded-full border border-border px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.firstName} {user?.lastName}
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${role}/my-profile`)}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROLE_HOME[role])}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>You can sign back in anytime with your iTeach account.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={onLogout}>Log out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
