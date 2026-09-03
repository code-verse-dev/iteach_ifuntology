import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
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
import {
  useDeleteStudentMutation,
  useGetMyStudentsQuery,
  useInviteStudentMutation,
  useResetStudentPasswordMutation,
} from "@/redux/services/apiSlices/studentSlice";
import { RootState } from "@/redux/store";

export default function MyStudentsPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const { data } = useGetMyStudentsQuery(user?._id, { skip: !user?._id });
  const students = data?.data ?? [];
  const [invite, { isLoading }] = useInviteStudentMutation();
  const [removeStudent] = useDeleteStudentMutation();
  const [resetPassword] = useResetStudentPasswordMutation();
  const [open, setOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const seats = (user?.assignments ?? []).reduce((s: number, a: any) => s + a.seats, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await invite({ teacherId: user._id, ...form }).unwrap();
      if (res?.status) {
        toast.success("Student invited");
        setOpen(false);
        setForm({ firstName: "", lastName: "", email: "", password: "" });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not invite student");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Classroom"
        title="My students"
        description={`Invite learners with credentials you control. Seats used: ${students.length} / ${seats || 0}.`}
        actions={<Button onClick={() => setOpen(true)}>Invite student</Button>}
      />
      <div className="surface-card overflow-hidden rounded-2xl border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-secondary/80 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s._id} className="border-t border-border/70">
                <td className="px-4 py-4 font-medium">{s.firstName} {s.lastName}</td>
                <td className="px-4 py-4">{s.email}</td>
                <td className="px-4 py-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setPasswordFor(s)}>Password</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await removeStudent({ teacherId: user._id, studentId: s._id });
                      toast.success("Student removed");
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite student</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></div>
            </div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Temporary password</Label><PasswordField value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Inviting..." : "Invite"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!passwordFor} onOpenChange={() => setPasswordFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset password for {passwordFor?.firstName}</DialogTitle></DialogHeader>
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
          <DialogFooter>
            <Button
              onClick={async () => {
                await resetPassword({ teacherId: user._id, studentId: passwordFor._id, password }).unwrap();
                toast.success("Password updated");
                setPasswordFor(null);
                setPassword("");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppPage>
  );
}
