export default function ListingLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-10" aria-busy="true">
      <div className="h-4 w-28 animate-pulse rounded-small bg-muted motion-reduce:animate-none" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="aspect-[4/3] animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
        <div className="h-80 animate-pulse rounded-card bg-muted motion-reduce:animate-none" />
      </div>
    </div>
  );
}
