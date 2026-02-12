import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function RaffleForm() {
  const [location] = useLocation();
  const [raffleId, setRaffleId] = useState<number | null>(null);
  const [raffle, setRaffle] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Extrair ID do sorteio da URL
  useEffect(() => {
    const match = location.match(/\/raffle\/(\d+)/);
    if (match) {
      setRaffleId(parseInt(match[1]));
    }
  }, [location]);

  // Buscar dados do sorteio
  const getRaffle = trpc.raffles.getById.useQuery(
    { id: raffleId! },
    { enabled: !!raffleId }
  );

  const addParticipant = trpc.raffles.addParticipant.useMutation({
    onSuccess: () => {
      toast.success("Você foi registrado no sorteio!");
      setName("");
      setEmail("");
      setPhone("");
      setAnswer("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => {
      toast.error("Erro ao registrar. Tente novamente.");
    },
  });

  useEffect(() => {
    if (getRaffle.data) {
      setRaffle(getRaffle.data);
    }
  }, [getRaffle.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Por favor, preencha seu nome");
      return;
    }
    if (!raffleId) {
      toast.error("Sorteio não encontrado");
      return;
    }
    await addParticipant.mutateAsync({
      raffleId,
      name,
      email,
      phone,
      answer,
    });
  };

  if (!raffleId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Sorteio não encontrado</p>
        </Card>
      </div>
    );
  }

  if (getRaffle.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-center text-muted-foreground">Sorteio não encontrado</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <h1 className="text-2xl font-light text-foreground">Igreja</h1>
          <p className="text-sm text-muted-foreground mt-1">Sorteio</p>
        </div>
      </header>

      {/* Content */}
      <div className="container py-12 max-w-md mx-auto">
        <Card className="p-8">
          <h2 className="text-xl font-light text-foreground mb-2">
            {raffle.title}
          </h2>
          {raffle.description && (
            <p className="text-sm text-muted-foreground mb-6">{raffle.description}</p>
          )}

          {submitted && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded text-accent text-sm">
              Você foi registrado no sorteio com sucesso!
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
                disabled={addParticipant.isPending}
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
                disabled={addParticipant.isPending}
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
                disabled={addParticipant.isPending}
              />
            </div>

            {raffle.question && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {raffle.question}
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Sua resposta..."
                  disabled={addParticipant.isPending}
                  rows={3}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={addParticipant.isPending}
            >
              {addParticipant.isPending ? "Registrando..." : "Participar"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Boa sorte!
          </p>
        </Card>
      </div>
    </div>
  );
}
