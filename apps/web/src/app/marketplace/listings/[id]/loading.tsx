export default function ListingLoading() {
  return (
    <div className="container pt-6 md:pt-10" aria-busy="true">
      <div className="h-4 w-40 rounded-pill bg-surface" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="aspect-[4/5] rounded-tile bg-surface lg:aspect-square" />
        <div className="h-96 rounded-card bg-surface" />
      </div>
    </div>
  );
}
