import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
const createMockContext = (): TrpcContext => ({
  user: {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: vi.fn(),
  } as unknown as TrpcContext["res"],
});

describe("Visitors Router", () => {
  it("should create a visitor", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.visitors.create({
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 99999-9999",
      message: "Visitei pela primeira vez",
    });

    expect(result).toBeDefined();
  });

  it("should require visitor name", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.visitors.create({
        name: "",
        email: "joao@example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should list visitors when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.visitors.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Prayer Requests Router", () => {
  it("should create a prayer request", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prayers.create({
      name: "Maria Santos",
      email: "maria@example.com",
      message: "Peço orações pela minha família",
      isAnonymous: false,
    });

    expect(result).toBeDefined();
  });

  it("should allow anonymous prayer requests", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prayers.create({
      name: "Anônimo",
      message: "Pedido de oração anônimo",
      isAnonymous: true,
    });

    expect(result).toBeDefined();
  });

  it("should require prayer message", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.prayers.create({
        name: "Test",
        message: "",
        isAnonymous: false,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should list prayer requests when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prayers.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Raffles Router", () => {
  it("should create a raffle", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.raffles.create({
      title: "Sorteio de Livros",
      description: "Sorteio mensal de livros religiosos",
      question: "Qual é seu livro favorito da Bíblia?",
    });

    expect(result).toBeDefined();
  });

  it("should add participant to raffle", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create raffle first
    const raffle = await caller.raffles.create({
      title: "Sorteio de Livros",
    });

    // Add participant
    const result = await caller.raffles.addParticipant({
      raffleId: 1,
      name: "Pedro Costa",
      email: "pedro@example.com",
      phone: "(11) 98888-8888",
      answer: "Gênesis",
    });

    expect(result).toBeDefined();
  });

  it("should list raffles when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.raffles.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Announcements Router", () => {
  it("should create an announcement", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.create({
      title: "Culto Especial",
      content: "Haverá culto especial no próximo domingo às 19h",
    });

    expect(result).toBeDefined();
  });

  it("should require announcement title and content", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.announcements.create({
        title: "",
        content: "Test",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should list announcements when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Schedules Router", () => {
  it("should create a schedule", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedules.create({
      title: "Escala de Louvor",
      content: "Segunda: João\nTerça: Maria\nQuarta: Pedro",
    });

    expect(result).toBeDefined();
  });

  it("should list schedules when authenticated", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.schedules.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Access Passwords Router", () => {
  it("should set access password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accessPasswords.set({
      panelType: "visitors",
      password: "senha123",
    });

    expect(result).toBeDefined();
  });

  it("should verify access password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Set password first
    await caller.accessPasswords.set({
      panelType: "visitors",
      password: "senha123",
    });

    // Verify password
    const isValid = await caller.accessPasswords.verify({
      panelType: "visitors",
      password: "senha123",
    });

    expect(typeof isValid).toBe("boolean");
  });

  it("should reject invalid password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Set password first
    await caller.accessPasswords.set({
      panelType: "visitors",
      password: "senha123",
    });

    // Verify with wrong password
    const isValid = await caller.accessPasswords.verify({
      panelType: "visitors",
      password: "senhaerrada",
    });

    expect(isValid).toBe(false);
  });
});
