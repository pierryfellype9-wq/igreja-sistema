import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PrayerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createPrayer = trpc.prayers.create.useMutation({
    onSuccess: () => {
      toast.success("Seu pedido de oração foi registrado. Que Deus o abençoe!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIsAnonymous(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      toast.error("Erro ao registrar. Tente novamente.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      toast.error("Por favor, descreva seu pedido de oração");
      return;
    }
    await createPrayer.mutateAsync({
      name: isAnonymous ? "Anônimo" : name,
      email: isAnonymous ? undefined : email,
      phone: isAnonymous ? undefined : phone,
      message,
      isAnonymous,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <h1 className="text-2xl font-light text-foreground">Igreja</h1>
          <p className="text-sm text-muted-foreground mt-1">Pedidos de Oração</p>
        </div>
      </header>

      {/* Content */}
      <div className="container py-12 max-w-md mx-auto">
        <Card className="p-8">
          <h2 className="text-xl font-light text-foreground mb-6">
            Envie seu Pedido de Oração
          </h2>

          {submitted && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded text-accent text-sm">
              Seu pedido foi registrado. Oraremos por você.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <label htmlFor="anonymous" className="text-sm font-medium text-foreground cursor-pointer">
                Enviar anonimamente
              </label>
            </div>

            {!isAnonymous && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    disabled={createPrayer.isPending}
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
                    disabled={createPrayer.isPending}
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
                    disabled={createPrayer.isPending}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Seu Pedido de Oração *
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descreva seu pedido de oração..."
                disabled={createPrayer.isPending}
                rows={5}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createPrayer.isPending}
            >
              {createPrayer.isPending ? "Enviando..." : "Enviar Pedido"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Seus pedidos são tratados com confidencialidade e respeito.
          </p>
        </Card>
      </div>
    </div>
  );
}
