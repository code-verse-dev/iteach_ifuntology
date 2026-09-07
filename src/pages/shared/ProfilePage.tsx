import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import {
  useGetMyProfileQuery,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
} from "@/redux/services/apiSlices/authSlice";
import { addUser, updateUserData } from "@/redux/services/Slices/userSlice";
import { RootState } from "@/redux/store";
import { UserRole } from "@/constants/roles";
import {
  getPasswordValidationError,
  PASSWORD_POLICY_HINT,
} from "@/utils/passwordValidation";

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const token = useSelector((state: RootState) => state.user.userToken);
  const dispatch = useDispatch();
  const { data: profileRes } = useGetMyProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [updatePassword, { isLoading: savingPass }] = useUpdatePasswordMutation();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phoneNumber ?? user?.phone ?? "",
    organization: user?.organization ?? "",
  });
  const [pass, setPass] = useState({ currentPassword: "", password: "", confirm: "" });

  useEffect(() => {
    const profile = profileRes?.data;
    if (!profile?._id) return;
    dispatch(updateUserData({ user: profile }));
    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      phone: profile.phoneNumber ?? "",
      organization: profile.organization ?? "",
    });
  }, [profileRes, dispatch]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        organization: form.organization,
      }).unwrap();
      if (res?.status) {
        dispatch(addUser({ user: { ...user, ...res.data }, token }));
        toast.success("Profile updated");
      } else {
        toast.error(res?.message || "Could not update profile");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update profile");
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = getPasswordValidationError(pass.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (pass.password !== pass.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const res: any = await updatePassword({
        email: user.email,
        oldPassword: pass.currentPassword,
        password: pass.password,
        type: user.role as UserRole,
      }).unwrap();
      if (res?.status) {
        toast.success("Password updated");
        setPass({ currentPassword: "", password: "", confirm: "" });
      } else {
        toast.error(res?.message || "Could not update password");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update password");
    }
  };

  const showOrganization = user?.role === "admin" || user?.role === "teacher";

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
          {user?.username ? (
            <div className="space-y-1.5"><Label>Username</Label><Input value={user.username} disabled /></div>
          ) : null}
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          {showOrganization ? (
            <div className="space-y-1.5"><Label>Organization</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
          ) : null}
          <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save profile"}</Button>
        </form>
        <form className="surface-card space-y-4 rounded-2xl border border-border/70 p-6" onSubmit={savePassword}>
          <h2 className="text-lg font-semibold">Update password</h2>
          <div className="space-y-1.5"><Label>Current password</Label><PasswordField value={pass.currentPassword} onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <PasswordField value={pass.password} onChange={(e) => setPass({ ...pass, password: e.target.value })} />
            <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
          </div>
          <div className="space-y-1.5"><Label>Confirm new password</Label><PasswordField value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} /></div>
          <Button type="submit" disabled={savingPass}>{savingPass ? "Saving..." : "Update password"}</Button>
        </form>
      </div>
    </AppPage>
  );
}
