export function AlertaBloqueio({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;

  return (
    <div
      role="alert"
      className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {mensagem}
    </div>
  );
}
