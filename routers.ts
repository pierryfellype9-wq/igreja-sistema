import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as authService from "./auth.service";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        try {
          const user = await authService.authenticateUser(input.email, input.password);
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          };
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }
      }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await authService.createUser(input.email, input.password, input.name);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to create user",
          });
        }
      }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.user.email) throw new Error("User email not found");
          const user = await authService.authenticateUser(ctx.user.email, input.currentPassword);
          if (!user) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Current password is incorrect",
            });
          }

          await authService.updateUserPassword(ctx.user.id, input.newPassword);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to change password",
          });
        }
      }),

    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Visitantes
  visitors: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createVisitor(input);
      }),
    list: protectedProcedure.query(async () => {
      return await db.getVisitors();
    }),
  }),

  // Pedidos de Oração
  prayers: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        message: z.string().min(1),
        isAnonymous: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        return await db.createPrayerRequest(input);
      }),
    list: protectedProcedure.query(async () => {
      return await db.getPrayerRequests();
    }),
  }),

  // Sorteios
  raffles: router({
    list: protectedProcedure.query(async () => {
      return await db.getRaffles();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getRaffleById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        question: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createRaffle(input);
      }),
    addParticipant: publicProcedure
      .input(z.object({
        raffleId: z.number(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        answer: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createRaffleParticipant(input);
      }),
    getParticipants: protectedProcedure
      .input(z.object({ raffleId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRaffleParticipants(input.raffleId);
      }),
  }),

  // Avisos
  announcements: router({
    list: protectedProcedure.query(async () => {
      return await db.getAnnouncements();
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createAnnouncement({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAnnouncement(input.id);
      }),
  }),

  // Escalas
  schedules: router({
    list: protectedProcedure.query(async () => {
      return await db.getSchedules();
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createSchedule({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteSchedule(input.id);
      }),
  }),

  // Arquivos
  files: router({
    list: protectedProcedure.query(async () => {
      return await db.getFiles();
    }),
    create: protectedProcedure
      .input(z.object({
        filename: z.string().min(1),
        fileKey: z.string().min(1),
        url: z.string().url(),
        mimeType: z.string().optional(),
        size: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createFile({
          ...input,
          uploadedBy: ctx.user.id,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteFile(input.id);
      }),
  }),

  // Senhas de Acesso
  accessPasswords: router({
    get: protectedProcedure
      .input(z.object({ panelType: z.enum(['visitors', 'prayers', 'raffles']) }))
      .query(async ({ input }) => {
        return await db.getAccessPassword(input.panelType);
      }),
    set: protectedProcedure
      .input(z.object({
        panelType: z.enum(['visitors', 'prayers', 'raffles']),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await db.setAccessPassword(input.panelType, input.password);
      }),
    verify: publicProcedure
      .input(z.object({
        panelType: z.enum(['visitors', 'prayers', 'raffles']),
        password: z.string(),
      }))
      .query(async ({ input }) => {
        const stored = await db.getAccessPassword(input.panelType);
        if (!stored) return false;
        return stored.password === input.password;
      }),
  }),
});

export type AppRouter = typeof appRouter;
