import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Send } from "lucide-react";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import socket from "@/config/socket";
import { useGetAdminAccountQuery } from "@/redux/services/apiSlices/authSlice";
import {
  useCreateChatMutation,
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/redux/services/apiSlices/chatSlice";
import { useGetMyEnrollmentsQuery, useGetMyStudentsQuery, useGetStudentsQuery } from "@/redux/services/apiSlices/studentSlice";
import { useGetTeachersQuery } from "@/redux/services/apiSlices/teacherSlice";
import { RootState } from "@/redux/store";
import { UserRole } from "@/constants/roles";
import { initials } from "@/utils/Functions";
import { mediaUrl } from "@/utils/mediaUrl";
import { cn } from "@/lib/utils";

type Contact = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  label?: string;
};

const personId = (value: any) => String(value?._id ?? value ?? "");
const personName = (person?: any) =>
  `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim() || person?.email || "User";

export default function MessagesPage() {
  const user = useSelector((state: RootState) => state.user.userData);
  const role: UserRole = user?.role ?? "student";
  const myId = String(user?._id ?? "");
  const tabs = role === "admin"
    ? ["teachers", "students"]
    : role === "teacher"
      ? ["students", "admin"]
      : ["teachers", "admin"];
  const [tab, setTab] = useState(tabs[0]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Contact | null>(null);
  const [activeChatId, setActiveChatId] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: chatsData, refetch: refetchChats } = useGetChatsQuery();
  const chats = chatsData?.data ?? [];
  const { data: messagesData, isFetching: loadingMessages } = useGetMessagesQuery(activeChatId, {
    skip: !activeChatId,
  });
  const [createChat] = useCreateChatMutation();
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  const { data: adminData } = useGetAdminAccountQuery(undefined, { skip: role === "admin" });
  const { data: teachersData } = useGetTeachersQuery({ page: 1, limit: 100 }, { skip: role !== "admin" });
  const { data: studentsData } = useGetStudentsQuery({ page: 1, limit: 100 }, { skip: role !== "admin" });
  const { data: myStudentsData } = useGetMyStudentsQuery({ page: 1, limit: 100 }, { skip: role !== "teacher" });
  const { data: enrollmentsData } = useGetMyEnrollmentsQuery(undefined, { skip: role !== "student" });

  const contacts = useMemo(() => {
    if (tab === "admin" && adminData?.data) {
      return [{
        _id: String(adminData.data._id),
        firstName: adminData.data.firstName,
        lastName: adminData.data.lastName,
        email: adminData.data.email,
        label: "Admin",
      }];
    }
    if (tab === "teachers") {
      if (role === "admin") {
        return (teachersData?.data ?? []).map((item: any) => ({
          _id: String(item._id),
          firstName: item.firstName,
          lastName: item.lastName,
          email: item.email,
          image: item.image,
          label: "Teacher",
        }));
      }
      const unique = new Map<string, Contact>();
      for (const enrollment of enrollmentsData?.data ?? []) {
        const teacher = enrollment.teacher;
        if (!teacher?._id) continue;
        unique.set(String(teacher._id), {
          _id: String(teacher._id),
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          image: teacher.image,
          label: "Teacher",
        });
      }
      return Array.from(unique.values());
    }
    if (role === "admin") {
      return (studentsData?.data ?? []).map((item: any) => ({
        _id: String(item._id),
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        image: item.image,
        label: "Student",
      }));
    }
    return (myStudentsData?.data ?? []).map((item: any) => ({
      _id: String(item._id),
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      image: item.image,
      label: "Student",
    }));
  }, [tab, role, adminData, teachersData, studentsData, myStudentsData, enrollmentsData]);

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) =>
      `${contact.firstName ?? ""} ${contact.lastName ?? ""} ${contact.email ?? ""}`.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const apiMessages = messagesData?.data ?? [];
  useEffect(() => {
    setLiveMessages(apiMessages);
  }, [activeChatId, messagesData]);

  useEffect(() => {
    const onMessage = (incoming: any) => {
      if (String(incoming?.chat) !== String(activeChatId)) return;
      setLiveMessages((prev) => {
        if (prev.some((item) => String(item._id) === String(incoming._id))) return prev;
        return [...prev, incoming];
      });
      refetchChats();
    };
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [activeChatId, refetchChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages.length, activeChatId]);

  const openContact = async (contact: Contact) => {
    setSelected(contact);
    const existing = chats.find((chat: any) => {
      const sender = personId(chat.sender);
      const receiver = personId(chat.receiver);
      return (sender === myId && receiver === contact._id) || (receiver === myId && sender === contact._id);
    });
    if (existing?._id) {
      setActiveChatId(String(existing._id));
      return;
    }
    try {
      const res: any = await createChat({ sender: myId, receiver: contact._id }).unwrap();
      if (res?.status && res?.data?._id) setActiveChatId(String(res.data._id));
      else toast.error(res?.message || "Could not start chat");
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not start chat");
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !activeChatId) return;
    try {
      const res: any = await sendMessage({ chatId: activeChatId, content }).unwrap();
      if (res?.status) {
        const created = res.data;
        setLiveMessages((prev) => {
          if (prev.some((item) => String(item._id) === String(created?._id))) return prev;
          return [...prev, created];
        });
        setText("");
        refetchChats();
      } else {
        toast.error(res?.message || "Could not send message");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not send message");
    }
  };

  return (
    <AppPage>
      <PageHeader
        eyebrow="Communication"
        title="Chat"
        description="Message teachers, students, and admin from one inbox."
      />
      <div className="surface-card grid min-h-[560px] overflow-hidden rounded-2xl border border-border/70 lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-border/70 lg:border-b-0 lg:border-r">
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={tab === value ? "default" : "outline"}
                  className="rounded-full capitalize"
                  onClick={() => setTab(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people"
            />
          </div>
          <ScrollArea className="h-[420px]">
            {filteredContacts.map((contact) => {
              const active = selected?._id === contact._id;
              return (
                <button
                  key={contact._id}
                  type="button"
                  onClick={() => openContact(contact)}
                  className={cn(
                    "flex w-full items-center gap-3 border-t border-border/50 px-4 py-3 text-left",
                    active ? "bg-primary/5" : "bg-white hover:bg-secondary/60",
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={mediaUrl(contact.image)} />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials(contact.firstName, contact.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{personName(contact)}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.label ?? contact.email}</p>
                  </div>
                </button>
              );
            })}
            {filteredContacts.length === 0 && (
              <p className="px-4 py-8 text-sm text-muted-foreground">No contacts in this list.</p>
            )}
          </ScrollArea>
        </aside>

        <div className="flex min-h-[420px] flex-col">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={mediaUrl(selected.image)} />
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials(selected.firstName, selected.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{personName(selected)}</p>
                  <p className="text-xs text-muted-foreground">{selected.label ?? selected.email}</p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {loadingMessages && <p className="text-sm text-muted-foreground">Loading messages...</p>}
                  {liveMessages.map((message: any) => {
                    const fromMe = personId(message.sender) === myId;
                    return (
                      <div
                        key={message._id}
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                          fromMe ? "ml-auto bg-primary text-white" : "bg-secondary",
                        )}
                      >
                        {message.content}
                      </div>
                    );
                  })}
                  {!loadingMessages && liveMessages.length === 0 && (
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <form className="flex gap-2 border-t border-border/70 p-3" onSubmit={send}>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message"
                  className="rounded-full"
                />
                <Button type="submit" className="rounded-full" disabled={sending || !activeChatId}>
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
              Select a person to start or continue a conversation.
            </div>
          )}
        </div>
      </div>
    </AppPage>
  );
}
