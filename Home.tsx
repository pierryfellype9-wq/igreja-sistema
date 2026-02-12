import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-8">
          <h1 className="text-3xl font-light text-foreground">Igreja</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo ao portal da comunidade</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          {/* Internal Site */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Área Interna
            </h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Acesso restrito para membros. Avisos, escalas e documentos da comunidade.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full"
            >
              Acessar
            </Button>
          </Card>

          {/* Visitors */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Visitantes
            </h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Seja bem-vindo! Deixe seus dados para que possamos entrar em contato.
            </p>
            <Button
              onClick={() => setLocation("/visitors")}
              variant="outline"
              className="w-full"
            >
              Formulário
            </Button>
          </Card>

          {/* Prayer Requests */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Pedidos de Oração
            </h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Compartilhe seus pedidos de oração com a comunidade. Oraremos por você.
            </p>
            <Button
              onClick={() => setLocation("/prayer")}
              variant="outline"
              className="w-full"
            >
              Enviar Pedido
            </Button>
          </Card>

          {/* Raffles */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-medium text-foreground mb-2">
              Sorteios
            </h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Participe dos sorteios e eventos da comunidade.
            </p>
            <Button
              onClick={() => setLocation("/raffle/1")}
              variant="outline"
              className="w-full"
            >
              Ver Sorteios
            </Button>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-6">
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Igreja. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
