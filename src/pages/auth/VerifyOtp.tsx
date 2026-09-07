import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import BrandLogo from "@/components/branding/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerifyOtpMutation } from "@/redux/services/apiSlices/authSlice";
import { UserRole } from "@/constants/roles";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const type: UserRole | undefined = location.state?.type;
  const [code, setCode] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  useEffect(() => {
    document.title = "Verify code • iTeach iFuntology";
  }, []);

  useEffect(() => {
    if (!email || !type) navigate("/forgot-password", { replace: true });
  }, [email, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await verifyOtp({ email, code }).unwrap();
      if (res?.status) {
        toast.success("Verification successful");
        navigate("/recover-password", { state: { email, code, type } });
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify code");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <div className="surface-card rounded-3xl border border-border/70 px-6 py-8 sm:px-8">
          <BrandLogo size="medium" withWordmark />
          <h1 className="mt-6 text-3xl font-bold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 4-digit code sent to {email}.
          </p>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                className="h-11 rounded-full tracking-[0.4em] text-center"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
                required
              />
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify code"}
            </Button>
          </form>
          <Link to="/forgot-password" className="mt-5 inline-block text-sm font-medium text-primary">
            Use a different email
          </Link>
        </div>
      </section>
    </AuthLayout>
  );
}
