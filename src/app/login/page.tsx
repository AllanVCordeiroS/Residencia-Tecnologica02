import HeroPanel from "@/components/login/HeroPanel";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <HeroPanel />

      <section className="bg-white p-12 text-slate-900">
        Painel direito
      </section>
    </main>
  );
}