"use server";

import { jwtVerify, SignJWT } from "jose";
import { JWTPayload } from "jose";

interface UserJwtPayload extends JWTPayload {
  jti: string;
  iat: number;
  userId: string;
  exp: number;
}

export const getJwtSecretKey = () => {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error(
      "NEXT_PUBLIC_JWT_SECRET environment variable is missing or empty"
    );
  }
  return secret;
};

export async function getExpirationDate(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    const expirationDateInSeconds = verified.payload.exp as number;
    return expirationDateInSeconds * 1000;
  } catch (error) {
    console.log("Error verifying token:");
    return null;
  }
}

export const getUserId = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload.userId as string;
  } catch (error) {
    return;
  }
};
