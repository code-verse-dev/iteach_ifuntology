import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/layout/AuthLayout";
import BrandLogo from "@/components/branding/BrandLogo";
import PasswordField from "@/components/inputs/PasswordField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/redux/services/apiSlices/authSlice";
import { UserRole } from "@/constants/roles";
import {
  getPasswordValidationError,
  PASSWORD_POLICY_HINT,
} from "@/utils/passwordValidation";

export default function RecoverPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const code = location.state?.code;
  const type: UserRole | undefined = location.state?.type;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    document.title = "Reset password • iTeach iFuntology";
  }, []);

  useEffect(() => {
    if (!email || !code || !type) navigate("/forgot-password", { replace: true });
  }, [email, code, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res: any = await resetPassword({ email, code, password, type: type! }).unwrap();
      if (res?.status) {
        toast.success("Password updated. Please sign in.");
        navigate("/login");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not reset password");
    }
  };

  return (
    <AuthLayout>
      <section className="mx-auto w-full max-w-lg">
        <div className="surface-card rounded-3xl border border-border/70 px-6 py-8 sm:px-8">
          <BrandLogo size="medium" withWordmark />
          <h1 className="mt-6 text-3xl font-bold">Create a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a password you will remember for {email}.</p>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>New password</Label>
              <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} required />
              <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <PasswordField value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Update password"}
            </Button>
          </form>
        </div>
      </section>
    </AuthLayout>
  );
}
