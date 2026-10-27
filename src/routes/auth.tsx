import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingreso de profesionales · Historia Clínica Digital" },
      { name: "description", content: "Acceso seguro para profesionales de rehabilitación cardiopulmonar." },
      { property: "og:title", content: "Ingreso de profesionales · Historia Clínica Digital" },
      { property: "og:description", content: "Acceso seguro para profesionales de rehabilitación cardiopulmonar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Correo inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  fullName: z.string().trim().max(120).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/pacientes" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        navigate({ to: "/pacientes" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { emailRedirectTo: window.location.origin + "/pacientes", data: { full_name: form.fullName } },
        });
        if (error) throw error;
        toast.success("Revise su correo para confirmar la cuenta.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No fue posible ingresar");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) return toast.error("No fue posible ingresar con Google");
    if (result.redirected) return;
    navigate({ to: "/pacientes" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card">
        <img src={logo.url} alt="Servicios de Rehabilitación Cardio Pulmonar" className="mx-auto h-28 w-auto" />
        <h1 className="mt-4 text-center text-xl font-semibold text-primary">
          {mode === "in" ? "Ingreso de profesionales" : "Crear cuenta de profesional"}
        </h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "up" && (
            <div className="space-y-1.5">
              <Label htmlFor="fn">Nombre completo</Label>
              <Input id="fn" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="em">Correo</Label>
            <Input id="em" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Contraseña</Label>
            <Input id="pw" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "in" ? "Ingresar" : "Registrarme"}
          </Button>
        </form>
        <div className="my-4 text-center text-xs text-muted-foreground">o</div>
        <Button variant="outline" className="w-full" onClick={google}>
          Continuar con Google
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-5 w-full text-center text-sm text-secondary hover:underline"
        >
          {mode === "in" ? "¿No tiene cuenta? Regístrese" : "¿Ya tiene cuenta? Ingrese"}
        </button>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acceso restringido a personal de salud autorizado. La información es reservada.
        </p>
      </div>
    </div>
  );
}
