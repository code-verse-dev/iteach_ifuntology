import { cn } from "@/lib/utils";
import { ImageUrl } from "@/utils/Functions";

type Size = "small" | "medium" | "large";

const sizes: Record<Size, string> = {
  small: "h-10 w-10",
  medium: "h-14 w-14",
  large: "h-[4.5rem] w-[4.5rem]",
};

type Props = {
  size?: Size;
  className?: string;
  withWordmark?: boolean;
};

export default function BrandLogo({ size = "medium", className, withWordmark = false }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={ImageUrl("logo.png")}
        alt="iTeach iFuntology"
        className={cn("rounded-2xl object-cover shadow-elev", sizes[size])}
      />
      {withWordmark && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-foreground">iTeach iFuntology</p>
          <p className="text-[11px] font-medium text-muted-foreground">Career & Literacy Foundation</p>
        </div>
      )}
    </div>
  );
}
