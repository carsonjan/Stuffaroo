export default function ProfileLoading() {
  return (
    <div className="container pt-6 md:pt-10" aria-busy="true">
      <div className="h-64 rounded-tile bg-surface" />
      <div className="mt-8 h-12 w-96 max-w-full rounded-pill bg-surface" />
    </div>
  );
}
