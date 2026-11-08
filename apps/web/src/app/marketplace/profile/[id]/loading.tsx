export default function ProfileLoading() {
  return (
    <div
      className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10"
      aria-busy="true"
    >
      <div className="h-32 animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
      <div className="mt-12 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        <div className="aspect-[4/5] animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
        <div className="aspect-[4/5] animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
        <div className="aspect-[4/5] animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
      </div>
    </div>
  );
}
