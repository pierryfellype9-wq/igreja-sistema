import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VisitorsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const createVisitor = trpc.visitors.create.useMutation({
    onSuccess: () => {
      toast.success("Obrigado por visitar! Seus dados foram registrados.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      toast.error("Erro ao registrar. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Por favor, preencha seu nome");
      return;
    }
    await createVisitor.mutateAsync({ name, email, phone, message });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <h1 className="text-2xl font-light text-foreground">Igreja</h1>
          <p className="text-sm text-muted-foreground mt-1">Bem-vindo visitante</p>
        </div>
      </header>

      {/* Content */}
      <div className="container py-12 max-w-md mx-auto">
        <Card className="p-8">
          <h2 className="text-xl font-light text-foreground mb-6">
            Formulário de Visitante
          </h2>

          {submitted && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded text-accent text-sm">
              Obrigado! Seus dados foram registrados com sucesso.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                disabled={createVisitor.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={createVisitor.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Telefone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={createVisitor.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mensagem
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Deixe uma mensagem (opcional)"
                disabled={createVisitor.isPending}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createVisitor.isPending}
            >
              {createVisitor.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Seus dados serão utilizados apenas para contato.
          </p>
        </Card>
      </div>
    </div>
  );
}
