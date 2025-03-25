import { cn } from "@/lib/utils";
import { SecuredByLeaf } from "./crossmint-leaf";

export function SecuredByCrossmint({
  color = "#67797F",
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex", className)}>
      <SecuredByLeaf color={color} />
    </div>
  );
}
