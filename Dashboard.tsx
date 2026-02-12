import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type TabType = "announcements" | "schedules" | "files" | "visitors" | "prayers" | "raffles";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("announcements");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const announcements = trpc.announcements.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const schedules = trpc.schedules.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const files = trpc.files.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const visitors = trpc.visitors.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const prayers = trpc.prayers.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Aviso criado com sucesso");
      setTitle("");
      setContent("");
      announcements.refetch();
    },
    onError: () => {
      toast.error("Erro ao criar aviso");
    },
  });

  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("Aviso removido");
      announcements.refetch();
    },
  });

  const createSchedule = trpc.schedules.create.useMutation({
    onSuccess: () => {
      toast.success("Escala criada com sucesso");
      setTitle("");
      setContent("");
      schedules.refetch();
    },
    onError: () => {
      toast.error("Erro ao criar escala");
    },
  });

  const deleteSchedule = trpc.schedules.delete.useMutation({
    onSuccess: () => {
      toast.success("Escala removida");
      schedules.refetch();
    },
  });

  const deleteFile = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("Arquivo removido");
      files.refetch();
    },
  });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsSubmitting(true);
    await createAnnouncement.mutateAsync({ title, content });
    setIsSubmitting(false);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsSubmitting(true);
    await createSchedule.mutateAsync({ title, content });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-foreground">Igreja</h1>
            <p className="text-sm text-muted-foreground">Painel de Administração</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/login")}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border sticky top-0 bg-background">
        <div className="container flex gap-1 overflow-x-auto">
          {[
            { id: "announcements" as const, label: "Avisos" },
            { id: "schedules" as const, label: "Escalas" },
            { id: "files" as const, label: "Arquivos" },
            { id: "visitors" as const, label: "Visitantes" },
            { id: "prayers" as const, label: "Orações" },
            { id: "raffles" as const, label: "Sorteios" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Avisos */}
        {activeTab === "announcements" && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">Novo Aviso</h2>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título do aviso"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Conteúdo
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Conteúdo do aviso"
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Aviso"}
                </Button>
              </form>
            </Card>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Avisos Recentes</h2>
              <div className="space-y-2">
                {announcements.data?.map((announcement) => (
                  <Card key={announcement.id} className="p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAnnouncement.mutateAsync({ id: announcement.id })}
                    >
                      Remover
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Escalas */}
        {activeTab === "schedules" && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">Nova Escala</h2>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da escala"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Conteúdo
                  </label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Conteúdo da escala (nomes, datas, horários)"
                    disabled={isSubmitting}
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Escala"}
                </Button>
              </form>
            </Card>

            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">Escalas Ativas</h2>
              <div className="space-y-2">
                {schedules.data?.map((schedule) => (
                  <Card key={schedule.id} className="p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{schedule.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{schedule.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(schedule.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSchedule.mutateAsync({ id: schedule.id })}
                    >
                      Remover
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Arquivos */}
        {activeTab === "files" && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">Arquivos</h2>
            <Card className="p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                Upload de arquivos será implementado com integração S3
              </p>
              <Button disabled>Upload de Arquivo</Button>
            </Card>
            <div className="space-y-2">
              {files.data?.map((file) => (
                <Card key={file.id} className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{file.filename}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size ? file.size / 1024 : 0).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile.mutateAsync({ id: file.id })}
                    >
                      Remover
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Visitantes */}
        {activeTab === "visitors" && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">
              Visitantes ({visitors.data?.length || 0})
            </h2>
            <div className="space-y-2">
              {visitors.data?.map((visitor) => (
                <Card key={visitor.id} className="p-4">
                  <h3 className="font-medium text-foreground">{visitor.name}</h3>
                  {visitor.email && (
                    <p className="text-sm text-muted-foreground">{visitor.email}</p>
                  )}
                  {visitor.phone && (
                    <p className="text-sm text-muted-foreground">{visitor.phone}</p>
                  )}
                  {visitor.message && (
                    <p className="text-sm text-muted-foreground mt-2">{visitor.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(visitor.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orações */}
        {activeTab === "prayers" && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">
              Pedidos de Oração ({prayers.data?.length || 0})
            </h2>
            <div className="space-y-2">
              {prayers.data?.map((prayer) => (
                <Card key={prayer.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {prayer.isAnonymous ? "Anônimo" : prayer.name}
                      </h3>
                      {!prayer.isAnonymous && prayer.email && (
                        <p className="text-sm text-muted-foreground">{prayer.email}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">{prayer.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(prayer.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sorteios */}
        {activeTab === "raffles" && (
          <div>
            <h2 className="text-lg font-medium text-foreground mb-4">Sorteios</h2>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                Gerenciamento de sorteios será implementado em breve
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
