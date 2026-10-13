import { Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function SignedOutState({ title, text }: { title: string; text: string }) {
  const { requireAuth } = useStore();
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <span className="soundhole mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-primary"><Library className="h-6 w-6" /></span>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{text}</p>
      <Button className="mt-6 rounded-full" onClick={() => requireAuth("", () => {})}>Sign in to get started</Button>
    </div>
  );
}

