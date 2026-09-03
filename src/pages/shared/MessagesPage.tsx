import { useState } from "react";
import { toast } from "sonner";
import AppPage, { PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetMessagesQuery,
  useGetThreadsQuery,
  useSendMessageMutation,
} from "@/redux/services/apiSlices/chatSlice";

export default function MessagesPage() {
  const { data: threadData } = useGetThreadsQuery();
  const threads = threadData?.data ?? [];
  const [active, setActive] = useState<string>("t-1");
  const { data: msgData } = useGetMessagesQuery(active, { skip: !active });
  const messages = msgData?.data ?? [];
  const [sendMessage] = useSendMessageMutation();
  const [text, setText] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendMessage({ threadId: active, text }).unwrap();
      setText("");
    } catch {
      toast.error("Could not send message");
    }
  };

  return (
    <AppPage>
      <PageHeader eyebrow="Communication" title="Chat" description="Simple classroom messaging between admin, teachers, and students." />
      <div className="surface-card grid min-h-[520px] overflow-hidden rounded-2xl border border-border/70 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border/70 lg:border-b-0 lg:border-r">
          {threads.map((t: any) => (
            <button
              key={t._id}
              type="button"
              onClick={() => setActive(t._id)}
              className={`block w-full border-b border-border/50 px-4 py-4 text-left ${active === t._id ? "bg-primary/5" : "bg-white"}`}
            >
              <p className="font-medium">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t.lastMessage}</p>
            </button>
          ))}
        </aside>
        <div className="flex min-h-[420px] flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((m: any) => (
                <div key={m._id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.fromMe ? "ml-auto bg-primary text-white" : "bg-secondary"}`}>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form className="flex gap-2 border-t border-border/70 p-3" onSubmit={send}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" className="rounded-full" />
            <Button type="submit" className="rounded-full">Send</Button>
          </form>
        </div>
      </div>
    </AppPage>
  );
}
