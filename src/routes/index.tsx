import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, CalendarCheck, Clock, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ema IA — Tu asistente de estética por WhatsApp" },
      { name: "description", content: "Ema IA agenda citas, responde a tus clientes por WhatsApp y mantiene tu agenda al día con trato cálido y profesional." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Ema IA</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
              Comenzar gratis
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span className="h-2 w-2 rounded-full bg-success" />
            Asistente IA conectada a WhatsApp
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            La nueva forma de
            <span className="block bg-gradient-to-r from-[oklch(0.55_0.12_188)] to-[oklch(0.7_0.14_165)] bg-clip-text text-transparent">
              agendar en tu estética
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg animate-in fade-in duration-1000">
            Ema atiende a tus clientes 24/7 por WhatsApp con un trato cercano,
            confirma citas automáticamente y mantiene tu agenda impecable.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-1000">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                Agendar mi demo
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Ver el dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Mockup */}
        <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-border bg-card p-3 shadow-soft animate-in fade-in zoom-in-95 duration-1000">
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-primary-soft p-4 md:grid-cols-3">
            {[
              { icon: MessageCircle, label: "Mensajes en vivo", value: "128 hoy" },
              { icon: CalendarCheck, label: "Citas confirmadas", value: "24 esta semana" },
              { icon: Clock, label: "Tiempo de respuesta", value: "< 5 seg" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-card p-5 shadow-soft">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pensada para clínicas estéticas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Beneficios reales para ti y tus pacientes desde el primer día.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Trato cálido y humano",
              desc: "Ema responde con empatía, recordando el contexto de cada cliente.",
            },
            {
              icon: CalendarCheck,
              title: "Agenda automatizada",
              desc: "Confirma, reagenda y cancela citas sin intervención manual.",
            },
            {
              icon: ShieldCheck,
              title: "Tus datos protegidos",
              desc: "Información cifrada, accesos controlados, cumplimiento total.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-primary p-10 text-center text-primary-foreground shadow-glow">
          <h3 className="text-2xl font-bold sm:text-3xl">Lleva tu estética al siguiente nivel</h3>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            Crea tu cuenta y configura a Ema en menos de 5 minutos.
          </p>
          <Link to="/login" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/95">
              Empezar ahora
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Ema IA — Asistente para estéticas</p>
          <p>Hecho con cuidado para tu clínica</p>
        </div>
      </footer>
    </div>
  );
}
