export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function ProjectCardSkeleton() {
  return (
    <div className="liquid-glass rounded-2xl p-5">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-6 h-1.5 w-full" />
      <Skeleton className="mt-4 h-3 w-1/3" />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-3 h-3 w-1/2" />
    </div>
  )
}
