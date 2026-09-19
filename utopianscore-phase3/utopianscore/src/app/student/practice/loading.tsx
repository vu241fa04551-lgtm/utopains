import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </main>
  );
}
