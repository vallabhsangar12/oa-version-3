import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { queryOne } from "./postgres";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export async function getUserFromCookies(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("token");

    if (!tokenCookie?.value) {
      return null;
    }

    const payload = verifyToken(tokenCookie.value);

    const user = await queryOne<{ id: string; email: string; name: string }>(
      "SELECT id, email, name FROM users WHERE id = $1",
      [payload.userId]
    );

    return user;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): JwtPayload | null {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);

    if (!tokenMatch) {
      return null;
    }

    return verifyToken(tokenMatch[1]);
  } catch {
    return null;
  }
}
