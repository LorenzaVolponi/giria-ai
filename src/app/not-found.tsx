import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O caminho acessado não existe nesta versão do app. Verifique a URL ou volte para a página inicial.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-md bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
      >
        Ir para início
      </Link>
    </main>
  );
}
