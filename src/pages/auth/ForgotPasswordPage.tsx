import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgetPasswordMutation } from "@/redux/services/apiSlices/authSlice";
import { UserRole } from "@/constants/roles";
import { cn } from "@/lib/utils";

const roles: { id: UserRole; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "teacher", label: "Teacher" },
  { id: "student", label: "Student" },
];

export default function ForgotPasswordPage() {
  const [forgetpassword, { isLoading }] = useForgetPasswordMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(location.state?.role ?? "admin");

  useEffect(() => {
    document.title = "Forgot Password • iTeach iFuntology";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await forgetpassword({ data: { email, type: role } }).unwrap();
      if (res?.status) {
        toast.success("Recovery email sent. Check your inbox for the 4-digit code.");
        navigate("/verify-otp", { state: { email, type: role } });
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send recovery email");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <div className="surface-card rounded-3xl border border-border/70 px-6 py-8 sm:px-8">
          <BrandLogo size="medium" withWordmark />
          <h1 className="mt-6 text-3xl font-bold">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your account type and email. We will send a 4-digit recovery code.
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
                      "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                      role === item.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white hover:border-primary/40",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="h-11 rounded-full pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send recovery code"}
            </Button>
          </form>
          <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </section>
    </AuthLayout>
  );
}
