import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mindlet_admin";
const SESSION_VALUE = "mindlet-admin-v1";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function signingSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("관리자 세션 환경 변수가 설정되지 않았습니다.");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", signingSecret())
    .update(value)
    .digest("hex");
}

export function createAdminSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const value = `${SESSION_VALUE}.${expires}`;
  return `${value}.${signature(value)}`;
}

export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== SESSION_VALUE) return false;
  const expires = Number(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + ADMIN_SESSION_MAX_AGE) return false;
  const value = `${parts[0]}.${parts[1]}`;
  const expected = `${value}.${signature(value)}`;
  const left = Buffer.from(token);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}
