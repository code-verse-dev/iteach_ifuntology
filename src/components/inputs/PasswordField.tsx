import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Input> & {
  label?: string;
};

export default function PasswordField({ className, ...props }: Props) {
  const [show, setShow] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type={show ? "text" : "password"} className="h-11 rounded-full pl-10 pr-11" {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow((s) => !s);
        }}
      >
        {show ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
