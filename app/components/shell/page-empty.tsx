export function PageEmpty({ title, message }: { title: string; message: string }) {
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-4 rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">{message}</p>
    </main>
  );
}
