import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, HeartHandshake, Mail, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import BrandLogo from "@/components/branding/BrandLogo";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import { useLoginMutation } from "@/redux/services/apiSlices/authSlice";
import { addUser } from "@/redux/services/Slices/userSlice";
import { ROLE_HOME, UserRole } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { setAccessTokenCookie } from "@/utils/authSession";

const features = [
  { label: "course access", icon: BookOpen },
  { label: "Teacher-led classrooms", icon: GraduationCap },
  { label: "Student invitations & seats", icon: Users },
  { label: "Nonprofit career literacy", icon: HeartHandshake },
];

const roles: { id: UserRole; label: string; hint: string }[] = [
  { id: "admin", label: "Admin", hint: "Author courses and assign seats" },
  { id: "teacher", label: "Teacher", hint: "Classroom and students" },
  { id: "student", label: "Student", hint: "Learn and earn certificates" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "Sign In • iTeach iFuntology";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await login({ identifier: email, password, role }).unwrap();
      if (res?.status) {
        const accessToken = res?.data?.accessToken;
        const loggedInUser = res?.data?.user;
        setAccessTokenCookie(accessToken);
        toast.success("Signed in successfully");
        dispatch(addUser({ user: loggedInUser, token: accessToken }));
        navigate(ROLE_HOME[loggedInUser?.role ?? role] ?? "/login");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <section className="grid w-full max-w-6xl grid-cols-1 items-stretch gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <div>
            <BrandLogo size="large" withWordmark />
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Nonprofit LMS
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
              Welcome to <span className="text-gradient-brand">iTeach iFuntology</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              A quieter classroom for teachers and students. Courses, modules, certificates, and chat.
            </p>
          </div>

          <div className="surface-card rounded-2xl border border-border/70 px-5 py-6 lg:px-6">
            <h2 className="text-lg font-bold">Built for learning, not selling</h2>
            <ul className="mt-5 space-y-3.5 text-sm text-muted-foreground">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-card rounded-3xl border border-border/70 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your account type, then enter your credentials.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Account type</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left transition",
                      role === item.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white hover:border-primary/40",
                    )}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{item.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{role === "student" ? "Email or Username" : "Email Address"}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  className="h-11 rounded-full pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "student" ? "you@iteach.org or username" : "you@iteach.org"}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  state={{ role }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordField
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}
