import { SecuredByLeaf } from "./crossmint-leaf";

export function SecuredByCrossmint({ color = "#67797F" }: { color?: string }) {
  return (
    <div className="flex">
      <SecuredByLeaf color={color} />
    </div>
  );
}
