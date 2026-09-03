import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "@/redux/services/apiSlices/authSlice";
import { addUser } from "@/redux/services/Slices/userSlice";
import { RootState } from "@/redux/store";

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const token = useSelector((state: RootState) => state.user.userToken);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: savingPass }] = useUpdatePasswordMutation();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [pass, setPass] = useState({ currentPassword: "", password: "", confirm: "" });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await updateProfile({ id: user._id, ...form }).unwrap();
      if (res?.status) {
        dispatch(addUser({ user: { ...user, ...res.data.user }, token }));
        toast.success("Profile updated");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update profile");
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.password !== pass.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const res: any = await updatePassword({
        id: user._id,
        currentPassword: pass.currentPassword,
        password: pass.password,
      }).unwrap();
      if (res?.status) {
        toast.success("Password updated");
        setPass({ currentPassword: "", password: "", confirm: "" });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update password");
    }
  };

  return (
    <AppPage>
      <PageHeader eyebrow="Account" title="Profile" description="View and edit your iTeach iFuntology account." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="surface-card space-y-4 rounded-2xl border border-border/70 p-6" onSubmit={saveProfile}>
          <h2 className="text-lg font-semibold">Personal details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save profile"}</Button>
        </form>
        <form className="surface-card space-y-4 rounded-2xl border border-border/70 p-6" onSubmit={savePassword}>
          <h2 className="text-lg font-semibold">Update password</h2>
          <div className="space-y-1.5"><Label>Current password</Label><PasswordField value={pass.currentPassword} onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>New password</Label><PasswordField value={pass.password} onChange={(e) => setPass({ ...pass, password: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Confirm new password</Label><PasswordField value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} /></div>
          <Button type="submit" disabled={savingPass}>{savingPass ? "Saving..." : "Update password"}</Button>
        </form>
      </div>
    </AppPage>
  );
}
