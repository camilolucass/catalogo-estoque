import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-7">
      <div className="space-y-3"><Skeleton className="h-4 w-36" /><Skeleton className="h-10 w-80 max-w-full" /><Skeleton className="h-5 w-[34rem] max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>
    </div>
  );
}
