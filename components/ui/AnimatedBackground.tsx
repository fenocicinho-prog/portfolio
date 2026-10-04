export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-blob a" />
      <div className="bg-blob b" />
      <div className="bg-blob c" />
    </div>
  );
}
