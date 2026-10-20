export default function BMark({
  className = "h-9 w-9 text-lg",
}: {
  className?: string;
}) {
  return (
    <span
      className={`flex items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white ${className}`}
    >
      B
    </span>
  );
}