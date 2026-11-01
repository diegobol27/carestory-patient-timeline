import { createFileRoute, Link } from "@tanstack/react-router";
import { FileHeart, Lock, Download, History } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Historia Clínica Digital · Rehabilitación Cardio Pulmonar" },
      { name: "description", content: "Registro clínico confidencial para rehabilitación cardiopulmonar, terapia respiratoria y terapia física domiciliaria." },
      { property: "og:title", content: "Historia Clínica Digital · Rehabilitación Cardio Pulmonar" },
      { property: "og:description", content: "Registro clínico confidencial, editable en línea y descargable para el paciente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Lock, title: "Confidencial", text: "Acceso solo con usuario del profesional. Cada profesional ve únicamente sus pacientes." },
  { icon: History, title: "Ingreso y evolución", text: "Los datos del paciente se conservan para cada nueva sesión de seguimiento." },
  { icon: Download, title: "Descargable", text: "Genere el PDF de la historia o de una sesión para entregarlo al paciente." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-14 pb-10 text-center">
        <img src={logo} alt="Servicios de Rehabilitación Cardio Pulmonar" className="h-48 w-auto sm:h-60" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-primary sm:text-5xl">Historia Clínica Digital</h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          Rehabilitación cardiopulmonar · Terapia respiratoria · Terapia física domiciliaria
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg">
            <Link to="/pacientes">
              <FileHeart /> Ingresar al sistema
            </Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card">
            <f.icon className="h-6 w-6 text-secondary" />
            <h3 className="mt-3 font-semibold text-primary">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
      <footer className="bg-brand py-4 text-center text-xs text-primary-foreground">
        Información sujeta a reserva — Ley 23 de 1981, Resolución 1995 de 1999, Ley 1581 de 2012 y Ley 2015 de 2020.
      </footer>
    </div>
  );
}
