export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
