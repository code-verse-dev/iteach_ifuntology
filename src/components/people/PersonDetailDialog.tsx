import { useState } from "react";
import { CheckCircle2, Mail, Reply } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const displayName = (person: any) =>
  `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim() || person?.name || "there";

const initials = (person: any) =>
  `${person?.firstName?.[0] ?? ""}${person?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

const Field = ({ label, value, className = "" }: { label: string; value?: string | number | null; className?: string }) => (
  <div className="space-y-2">
    <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    <div className={`flex min-h-[50px] items-center rounded-2xl bg-muted px-4 py-3.5 text-sm font-semibold ${className}`}>
      <span className="truncate">{value || "—"}</span>
    </div>
  </div>
);

export default function PersonDetailDialog({
  person,
  open,
  onOpenChange,
}: {
  person: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const name = displayName(person);
  const isTeacher = person?.role === "teacher";
  const isActive = (person?.status ?? "ACTIVE") === "ACTIVE";
  const registered = person?.createdAt
    ? new Date(person.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  const openContact = () => {
    if (!person?.email) {
      toast.error("No email address for this user");
      return;
    }
    setMessage(`Hi ${name},\n\n`);
    setContactOpen(true);
  };

  const sendMailto = () => {
    if (!person?.email) return;
    const subject = encodeURIComponent("Message from iTeach iFuntology");
    const body = encodeURIComponent(message.trim() || `Hi ${name},\n\n`);
    window.location.href = `mailto:${person.email}?subject=${subject}&body=${body}`;
    setContactOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[600px]">
          <div className="space-y-8 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl">{isTeacher ? "Teacher details" : "Student details"}</DialogTitle>
              <DialogDescription>View account information and classroom activity.</DialogDescription>
            </DialogHeader>

            {person && (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
                    <AvatarFallback className="text-xl font-bold">{initials(person)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-bold">{name}</p>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full name" value={name} />
                  <Field label="Email" value={person.email} />
                  <Field label="Role" value={isTeacher ? "Teacher" : "Student"} />
                  <Field label="Status" value={isActive ? "Active" : "Suspended"} className={isActive ? "text-emerald-600" : "text-rose-500"} />
                  <Field label="Registered date" value={registered} />
                  <Field label="Phone" value={person.phone} />
                </div>

                {isTeacher && (person.organization || person.city || person.country) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field label="Organization / School" value={person.organization} />
                    </div>
                    <Field label="Country" value={person.country} />
                    <Field label="State" value={person.state} />
                    <Field label="City" value={person.city} />
                    <Field label="Zip code" value={person.zipCode} />
                    {person.streetAddress && (
                      <div className="col-span-2">
                        <Field label="Street address" value={person.streetAddress} />
                      </div>
                    )}
                  </div>
                )}

                {isTeacher ? (
                  <div className="space-y-3">
                    <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Assigned courses</p>
                    {(person.assignedCourses ?? []).length > 0 ? (
                      <div className="space-y-2">
                        {person.assignedCourses.map((course: any) => (
                          <div
                            key={course.courseId}
                            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-700">{course.title}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {course.usedSeats ?? 0} / {course.seats ?? 0} seats
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-1 text-xs italic text-muted-foreground">No courses assigned yet</p>
                    )}
                    <p className="px-1 text-xs text-muted-foreground">
                      {person.studentCount ?? 0} student{(person.studentCount ?? 0) === 1 ? "" : "s"} invited
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Enrolled courses</p>
                    {(person.enrollments ?? []).length > 0 ? (
                      <div className="space-y-2">
                        {person.enrollments.map((enrollment: any) => {
                          const teacherName = [enrollment.teacher?.firstName, enrollment.teacher?.lastName].filter(Boolean).join(" ");
                          return (
                            <div key={enrollment._id} className="space-y-1.5 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                  <span className="truncate text-xs font-bold">{enrollment.courseType}</span>
                                </div>
                                <Badge variant="secondary" className="uppercase">{enrollment.status}</Badge>
                              </div>
                              <p className="pl-6 text-[11px] text-muted-foreground">
                                Teacher: <span className="font-semibold text-foreground">{teacherName || "—"}</span>
                                {enrollment.teacher?.email ? ` · ${enrollment.teacher.email}` : ""}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-1 text-xs italic text-muted-foreground">No course enrollments</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Surveys completed</p>
                  {(person.surveyResponses ?? []).length > 0 ? (
                    <div className="space-y-2">
                      {person.surveyResponses.map((response: any) => (
                        <div key={response._id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">{response.title}</p>
                              {response.type && <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{response.type}</p>}
                            </div>
                          </div>
                          {response.createdAt && (
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {new Date(response.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-1 text-xs italic text-muted-foreground">No surveys filled</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Close</Button>
                  <Button variant="outline" disabled={!person.email} onClick={openContact}>
                    <Reply className="h-4 w-4" />
                    Contact via email
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Contact via email</DialogTitle>
            <DialogDescription>
              Opens your email app to send a message to {name} ({person?.email}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea rows={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setContactOpen(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!person?.email} onClick={sendMailto}>
                <Mail className="h-4 w-4" />
                Open email app
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
