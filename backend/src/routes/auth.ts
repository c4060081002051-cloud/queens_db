import { Router } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import type { Config } from "../config.js";
import { userByEmailCi } from "../models/index.js";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

/** Valid bcrypt hash so unknown emails still pay compare cost */
const DUMMY_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G7.i1bq7QE.BG";

export function createAuthRouter(config: Config) {
  const r = Router();

  r.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid body",
        details: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;
    const normalized = email.trim();

    let hashToCompare = DUMMY_HASH;
    let userId: number | null = null;
    let userEmail = normalized;
    let role = "admin";

    try {
      const user = await userByEmailCi(normalized);
      if (user) {
        hashToCompare = user.passwordHash;
        userId = user.id;
        userEmail = user.email;
        role = user.role;
      }
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: "Database unavailable" });
    }

    const ok = await bcrypt.compare(password, hashToCompare);
    if (!ok || userId === null) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: String(userId), role, email: userEmail },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ token });
  });

  r.get("/me", (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload & {
        sub: string;
        role: string;
        email: string;
      };
      return res.json({
        user: {
          sub: payload.sub,
          role: payload.role,
          email: payload.email,
        },
      });
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  });

  return r;
}
