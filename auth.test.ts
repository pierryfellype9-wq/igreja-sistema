import { describe, it, expect, beforeEach } from "vitest";
import * as authService from "./auth.service";
import * as db from "./db";

describe("Auth Service", () => {
  const testEmail = "test-auth@example.com";
  const testPassword = "TestPassword123";

  beforeEach(async () => {
    // Clean up test user if exists
    try {
      const user = await db.getInternalUserByEmail(testEmail);
      if (user) {
        await db.deleteInternalUser(user.id);
      }
    } catch (error) {
      // User doesn't exist, that's fine
    }
  });

  describe("Password Hashing", () => {
    it("should hash password", async () => {
      const hash = await authService.hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify correct password", async () => {
      const hash = await authService.hashPassword(testPassword);
      const isValid = await authService.verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const hash = await authService.hashPassword(testPassword);
      const isValid = await authService.verifyPassword("WrongPassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("User Creation", () => {
    it("should create user with hashed password", async () => {
      const result = await authService.createUser(testEmail, testPassword, "Test User");
      expect(result).toBeDefined();

      // Verify user was created
      const user = await db.getInternalUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.name).toBe("Test User");
      expect(user?.role).toBe("member");
      expect(user?.isActive).toBe(true);
    });

    it("should not allow duplicate email", async () => {
      await authService.createUser(testEmail, testPassword);

      try {
        await authService.createUser(testEmail, "AnotherPassword123");
        expect.fail("Should have thrown error for duplicate email");
      } catch (error) {
        expect((error as Error).message).toContain("already exists");
      }
    });

    it("should create admin user", async () => {
      const adminEmail = "admin-test@example.com";
      await authService.createUser(adminEmail, testPassword, "Admin User", "admin");

      const user = await db.getInternalUserByEmail(adminEmail);
      expect(user?.role).toBe("admin");

      // Clean up
      if (user) {
        await db.deleteInternalUser(user.id);
      }
    });
  });

  describe("User Authentication", () => {
    beforeEach(async () => {
      // Create test user
      await authService.createUser(testEmail, testPassword, "Test User");
    });

    it("should authenticate user with correct credentials", async () => {
      const user = await authService.authenticateUser(testEmail, testPassword);
      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.name).toBe("Test User");
    });

    it("should reject authentication with wrong password", async () => {
      try {
        await authService.authenticateUser(testEmail, "WrongPassword");
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toContain("Invalid email or password");
      }
    });

    it("should reject authentication with non-existent email", async () => {
      try {
        await authService.authenticateUser("nonexistent@example.com", testPassword);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toContain("Invalid email or password");
      }
    });

    it("should reject authentication for inactive user", async () => {
      const user = await db.getInternalUserByEmail(testEmail);
      if (user) {
        await db.updateInternalUser(user.id, { isActive: false });
      }

      try {
        await authService.authenticateUser(testEmail, testPassword);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toContain("inactive");
      }
    });
  });

  describe("Password Change", () => {
    beforeEach(async () => {
      await authService.createUser(testEmail, testPassword, "Test User");
    });

    it("should update user password", async () => {
      const user = await db.getInternalUserByEmail(testEmail);
      expect(user).toBeDefined();

      const newPassword = "NewPassword456";
      if (user) {
        await authService.updateUserPassword(user.id, newPassword);
      }

      // Verify old password doesn't work
      try {
        await authService.authenticateUser(testEmail, testPassword);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect((error as Error).message).toContain("Invalid");
      }

      // Verify new password works
      const authenticatedUser = await authService.authenticateUser(testEmail, newPassword);
      expect(authenticatedUser).toBeDefined();
    });
  });
});
