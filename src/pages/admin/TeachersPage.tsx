import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import PersonDetailDialog from "@/components/people/PersonDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/inputs/PasswordField";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useCreateTeacherMutation,
  useGetTeachersQuery,
  useUpdateTeacherPasswordMutation,
} from "@/redux/services/apiSlices/teacherSlice";
import { courses } from "@/mock/data";

export default function TeachersPage() {
  const { data } = useGetTeachersQuery();
  const teachers = data?.data ?? [];
  const [createTeacher, { isLoading: creating }] = useCreateTeacherMutation();
  const [updatePassword] = useUpdateTeacherPasswordMutation();
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    country: "",
    state: "",
    city: "",
    streetAddress: "",
    zipCode: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState("");

  const courseTitle = useMemo(() => Object.fromEntries(courses.map((c) => [c._id, c.title])), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res: any = await createTeacher(form).unwrap();
      if (res?.status) {
        toast.success("Teacher created");
        setOpen(false);
        setForm(emptyForm);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not create teacher");
    }
  };

  const savePassword = async () => {
    try {
      const res: any = await updatePassword({ id: passwordOpen._id, password: newPassword }).unwrap();
      if (res?.status) {
        toast.success("Password updated");
        setPasswordOpen(null);
        setNewPassword("");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update password");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="People"
        title="Teachers"
        description="Admin-created accounts only. Assign lifetime courses and student seats, then update them later."
        actions={<Button onClick={() => setOpen(true)}>Create teacher</Button>}
      />
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium">Assigned courses</th>
              <th className="px-4 py-3 font-medium">Seats</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t: any) => {
              const seats = (t.assignments ?? []).reduce((s: number, a: any) => s + a.seats, 0);
              const used = (t.assignments ?? []).reduce((s: number, a: any) => s + a.usedSeats, 0);
              return (
                <tr key={t._id} className="border-t border-border/70">
                  <td className="px-4 py-4">
                    <p className="font-medium">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(t.assignments ?? []).length === 0 && <span className="text-muted-foreground">None yet</span>}
                      {(t.assignments ?? []).map((a: any) => (
                        <Badge key={a.courseId} variant="secondary">{courseTitle[a.courseId] ?? a.courseId}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">{used} / {seats || 0}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelected(t)}>
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPasswordOpen(t)}>Password</Button>
                      <Button size="sm" asChild>
                        <Link to={`/admin/teachers/${t._id}`}>Assign courses</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create teacher</DialogTitle>
          </DialogHeader>
          <form className="space-y-6" onSubmit={submit}>
            <div>
              <p className="text-sm font-semibold">Account information</p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>First name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Last name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone number</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <Label>Temporary password *</Label>
                  <PasswordField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm password *</Label>
                  <PasswordField value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Organization information</p>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Organization / School name *</Label>
                  <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Springfield High School" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Country *</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>City *</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Street address *</Label>
                  <Input value={form.streetAddress} onChange={(e) => setForm({ ...form, streetAddress: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Zip code *</Label>
                  <Input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>{creating ? "Saving..." : "Create teacher"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PersonDetailDialog person={selected} open={!!selected} onOpenChange={(open) => !open && setSelected(null)} />

      <Dialog open={!!passwordOpen} onOpenChange={() => setPasswordOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update password for {passwordOpen?.firstName}</DialogTitle>
          </DialogHeader>
          <PasswordField value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <DialogFooter>
            <Button onClick={savePassword}>Save password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
