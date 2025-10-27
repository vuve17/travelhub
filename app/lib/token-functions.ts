// "use server";

// import { jwtVerify, SignJWT } from "jose";
// import { NextResponse } from "next/server";
// import { getExpirationDate, getJwtSecretKey } from "./auth-functions";

// export async function createAccessKey(
//   userId: string
// ): Promise<NextResponse<{ token: string }>> {
//   try {
//     const accessExpiration = Math.floor(Date.now() / 1000) + 5 * 60;
//     const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

//     const accessToken = await new SignJWT({ userId })
//       .setProtectedHeader({ alg: "HS256" })
//       .setExpirationTime(accessExpiration)
//       .sign(secret);

//     const accessExpirationDate = new Date(
//       accessExpiration * 1000
//     ).toISOString();

//     const insertKey = await insertKeyInDb(
//       accessToken,
//       userId,
//       accessExpirationDate,
//       "access"
//     );
//     // if (!insertKey.success) {
//     //   console.log("failed insert in db");
//     //   throw NextResponse.json(
//     //     { message: "Failed to insert access key in database" },
//     //     { status: 500 }
//     //   );
//     // }
//     return NextResponse.json({ token: accessToken }, { status: 200 });
//   } catch (error) {
//     console.error("Error creating access token:", error);
//     throw NextResponse.json(
//       { message: "Failed to insert access key in database" },
//       { status: 500 }
//     );
//   }
// }

// export async function createRefreshKey(userId: string): Promise<createToken> {
//   try {
//     console.log("creating ref token");
//     const refreshExpiration =
//       Math.floor(Date.now() / 1000) + 2 * 30 * 24 * 60 * 60;
//     const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

//     const refreshToken = await new SignJWT({ userId })
//       .setProtectedHeader({ alg: "HS256" })
//       .setExpirationTime(refreshExpiration)
//       .sign(secret);

//     const refreshExpirationDate = new Date(
//       refreshExpiration * 1000
//     ).toISOString();

//     const insertKey = await insertKeyInDb(
//       refreshToken,
//       userId,
//       refreshExpirationDate,
//       "refresh"
//     );
//     if (!insertKey.success) {
//       console.log("no success :( ");

//       return { success: false };
//     }
//     console.log("success :( ");
//     return { success: true, token: refreshToken };
//   } catch (error) {
//     console.error("Error creating refresh token:", error);
//     return { success: false };
//   }
// }

// export async function insertKeyInDb(
//   key: string,
//   userId: string,
//   expiration_date: string,
//   type: "access" | "refresh"
// ) {
//   const client = await db.connect();
//   try {
//     const query = `
//         INSERT INTO user_${type}_key (${type}_key, user_id, expiration_date)
//         VALUES ($1, $2, $3)
//         `;
//     await client.query(query, [key, userId, expiration_date]);
//     return { success: true };
//   } catch (error) {
//     console.log("catch error");
//     return { success: false };
//   } finally {
//     client.release();
//   }
// }

// export async function deleteAllKeys(
//   userId: string,
//   type: "refresh" | "access"
// ) {
//   const client = await db.connect();
//   try {
//     const query = `DELETE FROM user_${type}_key WHERE user_id = $1`;
//     console.log(`Executing query: ${query}, with userId: ${userId}`);

//     const result = await client.query(query, [userId]);

//     if (result.rowCount > 0) {
//       console.log("Delete all successful");
//       return { success: true };
//     } else {
//       console.log("No rows deleted");
//       return { success: false };
//     }
//   } catch (error) {
//     console.error("Error deleting keys:", error);
//     return { success: false };
//   } finally {
//     client.release();
//   }
// }

// export async function deleteKey(key: string, type: "refresh" | "access") {
//   const client = await db.connect();
//   try {
//     console.log(`DELETE FROM user_${type}_key where ${type}_key = '${key}'`);

//     const query = `DELETE FROM user_${type}_key where ${type}_key = $1`;

//     const result = await client.query(query, [key]);

//     console.log("delete one");

//     if (result.rowCount > 0) {
//       console.log("if true success");
//       return { success: true };
//     } else {
//       console.log("else false");
//       return { success: false };
//     }
//   } catch (error) {
//     console.log("catch false");
//     return { success: false };
//   } finally {
//     client.release();
//   }
// }

// export async function readKeysFromDb(userId: string): Promise<KeyResult> {
//   const client = await db.connect();

//   try {
//     const refreshKeyResult = await client.sql`
//         SELECT  refresh_key FROM user_refresh_key
//         WHERE user_id = ${userId}
//         `;

//     const accessKeyResult = await client.sql`
//         SELECT  access_key FROM user_access_key
//         WHERE user_id = ${userId}
//         `;

//     if (refreshKeyResult.rowCount > 1) {
//       console.log("too many refresh keys");
//       // console.log(refreshKeyResult.rows)
//       // const refreshKeysArray = refreshKeyResult.rows.map(row => row.refresh_key);
//       return {
//         result: "many",
//         message: "Too many refresh keys",
//         userId: userId,
//       };
//     }

//     if (accessKeyResult.rowCount > 1) {
//       console.log("too many access keys");
//       // const accessKeysArray = accessKeyResult.rows.map(row => row.access_key);
//       return {
//         result: "many",
//         message: "Too many access keys",
//         userId: userId,
//       };
//     }

//     const refreshKey: string | undefined =
//       refreshKeyResult.rows.length > 0
//         ? refreshKeyResult.rows[0].refresh_key
//         : undefined;
//     const accessKey: string | undefined =
//       accessKeyResult.rows.length > 0
//         ? accessKeyResult.rows[0].access_key
//         : undefined;

//     console.log("refreshKey: ", refreshKey);
//     if (refreshKey !== undefined && accessKey !== undefined) {
//       console.log("keys EXISTTT");
//       return {
//         result: "success",
//         message: "Keys exist in database",
//         refreshKey: refreshKey,
//         accessKey: accessKey,
//       };
//     } else if (refreshKey === undefined && accessKey === undefined) {
//       console.log("No keys found");
//       return { result: "missing", message: "No keys found" };
//     } else if (refreshKey === undefined && accessKey) {
//       console.log("refresh key doesn t  EXISTTT", accessKey);
//       return {
//         result: "missing",
//         message: "Refresh key is missing",
//         accessKey: accessKey,
//       };
//     } else if (accessKey === undefined && refreshKey) {
//       console.log("access key doesn t  EXISTTT");
//       return {
//         result: "missing",
//         message: "Access key is missing",
//         refreshKey: refreshKey,
//       };
//     } else {
//       return { result: "error", message: "No Key cases matched, error 500" };
//     }
//   } catch (error) {
//     console.log(error);
//     return {
//       message: "something went wrong while reading keys",
//       result: "error",
//     };
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// }

// export async function tokenExpirationDateValidation(token: string) {
//   const tokenDate = await getExpirationDate(token);
//   if (tokenDate) {
//     return true;
//   } else {
//     return false;
//   }
// }

// export async function handleReadKeysFromDb(
//   userId: string
// ): Promise<NextResponse<KeysInDb>> {
//   const keysInDb: KeyResult = await readKeysFromDb(userId);

//   if (
//     keysInDb.result === "success" &&
//     keysInDb.refreshKey &&
//     keysInDb.accessKey
//   ) {
//     const validRefreshKey = await tokenExpirationDateValidation(
//       keysInDb.refreshKey
//     );
//     const validAccessKey = await tokenExpirationDateValidation(
//       keysInDb.accessKey
//     );

//     if (validRefreshKey && validAccessKey) {
//       console.log("success: ", keysInDb.refreshKey, " ", keysInDb.accessKey);
//       return NextResponse.json(
//         { refreshToken: keysInDb.refreshKey, accessToken: keysInDb.accessKey },
//         { status: 200 }
//       );
//     } else if (!validAccessKey && !validRefreshKey) {
//       const newRefreshKey = await createRefreshKey(userId);
//       const newAccessKey = await createAccessKey(userId);
//       if (newRefreshKey.success && newAccessKey.success) {
//         return NextResponse.json(
//           {
//             refreshToken: newRefreshKey.token,
//             accessToken: newAccessKey.token,
//           },
//           { status: 200 }
//         );
//       }
//       return NextResponse.json(
//         { message: "token validation failed" },
//         { status: 404 }
//       );
//     } else if (!validAccessKey && validRefreshKey) {
//       const deleteInvalidKey = await deleteKey(keysInDb.accessKey, "access");
//       if (!deleteInvalidKey.success) {
//         return NextResponse.json(
//           { message: "something went wrong with new access key" },
//           { status: 500 }
//         );
//       }
//       const newAccessKey = await createAccessKey(userId);
//       if (!newAccessKey.success) {
//         return NextResponse.json(
//           { message: "something went wrong with new access key" },
//           { status: 404 }
//         );
//       }
//       return NextResponse.json(
//         { refreshToken: keysInDb.refreshKey, accessToken: newAccessKey.token },
//         { status: 200 }
//       );
//     }
//   } else if (keysInDb.result === "missing") {
//     if (keysInDb.message === "Access key is missing" && keysInDb.refreshKey) {
//       const validRefreshKey = await tokenExpirationDateValidation(
//         keysInDb.refreshKey
//       );
//       if (!validRefreshKey) {
//         const deleteOldRefreshKey = await deleteKey(
//           keysInDb.refreshKey,
//           "refresh"
//         );
//         const newRefreshKey: createToken = await createRefreshKey(userId);
//         if (!newRefreshKey.success || !deleteOldRefreshKey) {
//           return NextResponse.json(
//             { message: "Error creating new refresh key" },
//             { status: 500 }
//           );
//         }
//         const newAccessKey = await createAccessKey(userId);
//         if (!newAccessKey.success) {
//           return NextResponse.json(
//             { message: "Error creating new access key" },
//             { status: 500 }
//           );
//         }
//         return NextResponse.json(
//           {
//             refreshToken: newRefreshKey.token,
//             accessToken: newAccessKey.token,
//           },
//           { status: 200 }
//         );
//       }
//       const newAccessKey = await createAccessKey(userId);
//       if (!newAccessKey.success) {
//         return NextResponse.json(
//           { message: "Create access key server error" },
//           { status: 500 }
//         );
//       }
//       return NextResponse.json(
//         { refreshToken: keysInDb.refreshKey, accessToken: newAccessKey.token },
//         { status: 200 }
//       );
//     } else if (
//       keysInDb.message === "Refresh key is missing" &&
//       keysInDb.accessKey
//     ) {
//       const validAccessKey = await tokenExpirationDateValidation(
//         keysInDb.accessKey
//       );
//       if (!validAccessKey) {
//         const deleteOldAccessKey = await deleteKey(
//           keysInDb.accessKey,
//           "access"
//         );
//         const newAccessKey: createToken = await createAccessKey(userId);
//         if (!newAccessKey.success || !deleteOldAccessKey) {
//           return NextResponse.json(
//             { message: "Error creating new refresh key" },
//             { status: 500 }
//           );
//         }
//         const newRefreshKey = await createRefreshKey(userId);
//         if (!newRefreshKey.success) {
//           return NextResponse.json(
//             { message: "Error creating new access key" },
//             { status: 500 }
//           );
//         }
//         return NextResponse.json(
//           {
//             refreshToken: newRefreshKey.token,
//             accessToken: newAccessKey.token,
//           },
//           { status: 200 }
//         );
//       }
//       const newRefreshKey = await createRefreshKey(userId);
//       if (!newRefreshKey.success) {
//         return NextResponse.json(
//           { message: "Create refresh key server error" },
//           { status: 500 }
//         );
//       }
//       return NextResponse.json(
//         { refreshToken: newRefreshKey.token, accessToken: keysInDb.accessKey },
//         { status: 200 }
//       );
//     } else if (keysInDb.message === "No keys found") {
//       console.log("log in: 1");
//       try {
//         console.log("log in: 2");
//         const newRefreshKey = await createRefreshKey(userId);
//         const newAccessKey = await createAccessKey(userId);
//         console.log(newRefreshKey, `\n`, newAccessKey);
//         if (newRefreshKey.success && newAccessKey.success) {
//           console.log("log in: 3");
//           return NextResponse.json(
//             {
//               refreshToken: newRefreshKey.token,
//               accessToken: newAccessKey.token,
//             },
//             { status: 200 }
//           );
//         }
//       } catch (error) {
//         console.error(error);
//         return NextResponse.json(
//           { message: "token creation failed" },
//           { status: 404 }
//         );
//       }
//       console.log("log in: 4");
//     }
//   } else if (keysInDb.result === "many") {
//     if (keysInDb.message === "Too many access keys") {
//       try {
//         const delAlltry = await deleteAllKeys(userId, "access");
//         if (delAlltry.success) {
//           return await handleReadKeysFromDb(userId);
//         } else {
//           return NextResponse.json(
//             { message: "something went wrong while deleting all access keys" },
//             { status: 500 }
//           );
//         }
//       } catch (error) {
//         return NextResponse.json(
//           { message: "many else error" },
//           { status: 500 }
//         );
//       }
//     } else if (keysInDb.message === "Too many refresh keys") {
//       try {
//         const delAlltry = await deleteAllKeys(userId, "refresh");
//         if (delAlltry.success) {
//           return await handleReadKeysFromDb(userId); // Missing return statement added here
//         } else {
//           return NextResponse.json(
//             { message: "something went wrong while deleting all refresh keys" },
//             { status: 500 }
//           );
//         }
//       } catch (error) {
//         return NextResponse.json(
//           { message: "many else error" },
//           { status: 500 }
//         );
//       }
//     } else {
//       console.error("many error");
//       return NextResponse.json({ message: "many else error" }, { status: 500 });
//     }
//   } else {
//     return NextResponse.json(
//       { message: "Read/Write error with user keys" },
//       { status: 500 }
//     );
//   }

//   return NextResponse.json({ message: "final return" }, { status: 500 });
// }

// export async function verifyExpirationDate(token: string) {
//   try {
//     const secret = getJwtSecretKey();
//     const verified = await jwtVerify(token, new TextEncoder().encode(secret));
//     console.log("pass");
//     const expirationDateInSeconds = verified.payload.exp as number;
//     return expirationDateInSeconds * 1000;
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     return null;
//   }
// }

// export async function Test(userId: string) {
//   const client = await db.connect();
//   const refreshKeyResult = await client.sql`
//     SELECT  refresh_key FROM user_refresh_key
//     WHERE user_id = ${userId}
//     `;

//   const accessKeyResult = await client.sql`
//     SELECT  access_key FROM user_access_key
//     WHERE user_id = ${userId}
//     `;

//   const refreshKey: string | undefined =
//     refreshKeyResult.rows.length > 0
//       ? refreshKeyResult.rows[0].refresh_key
//       : undefined;
//   const accessKey: string | undefined =
//     accessKeyResult.rows.length > 0
//       ? accessKeyResult.rows[0].access_key
//       : undefined;

//   if (refreshKey !== undefined && accessKey !== undefined) {
//     console.log("keys EXISTTT");
//     const refereshExp = await verifyExpirationDate(refreshKey);
//     const accessExp = await verifyExpirationDate(accessKey);
//     console.log("refereshExp:  ", refereshExp);
//     console.log("accessExp:  ", accessExp);
//     return {
//       result: "success",
//       message: "Keys exist in database",
//       refreshToken: refreshKey,
//       accessToken: accessKey,
//     };
//   }
// }

"use server";

import { jwtVerify, SignJWT } from "jose";
import { NextResponse } from "next/server";
import { getExpirationDate, getJwtSecretKey } from "./auth-functions";
import { prisma } from "../lib/prisma";
import { KeyType } from "../generated/prisma";

// --- TYPE DEFINITIONS ---
// Koristimo minimalne tipove
interface TokenResult {
  success: boolean;
  token?: string;
}

// --- CORE DATABASE FUNCTIONS (PRISMA) ---

/**
 * Creates or updates an access/refresh key using Prisma upsert.
 */
export async function insertKeyInDb(
  key: string,
  userId: number, // User ID is now number/Int
  expirationDate: string,
  type: "access" | "refresh"
): Promise<boolean> {
  const keyType = type === "access" ? KeyType.ACCESS : KeyType.REFRESH;
  const keyExpiration = new Date(expirationDate);

  const result = await prisma.userKey.upsert({
    where: {
      userId_type: {
        // Kompozitni ID za upsert
        userId: userId,
        type: keyType,
      },
    },
    update: { key: key, expirationDate: keyExpiration },
    create: {
      key: key,
      userId: userId,
      expirationDate: keyExpiration,
      type: keyType,
    },
  });

  return result !== null;
}

/**
 * Deletes all keys of a specific type for a user.
 */
export async function deleteAllKeys(
  userId: number, // User ID is now number/Int
  type: "refresh" | "access"
): Promise<boolean> {
  const keyType = type === "access" ? KeyType.ACCESS : KeyType.REFRESH;

  const result = await safeExecute(() =>
    prisma.userKey.deleteMany({
      where: { userId: userId, type: keyType },
    })
  );

  // It's considered successful even if 0 rows were deleted.
  return result !== null;
}

/**
 * Deletes a single key by its unique token string.
 */
export async function deleteKey(key: string): Promise<boolean> {
  // Use deleteMany since delete requires the unique identifier, which is the key string.
  // We use deleteMany here to avoid a Prisma error if the key isn't found (P2025)
  const result = await safeExecute(() =>
    prisma.userKey.deleteMany({
      where: { key: key },
    })
  );

  return result !== null;
}

/**
 * Reads both access and refresh keys from the database for a given user.
 */
export async function readKeysFromDb(userId: number) {
  // User ID is now number/Int
  const keys = await safeExecute(() =>
    prisma.userKey.findMany({
      where: { userId: userId },
      select: { key: true, type: true },
    })
  );

  if (!keys) {
    return { refreshKey: undefined, accessKey: undefined, error: true };
  }

  const refreshKey = keys.find((k) => k.type === KeyType.REFRESH)?.key;
  const accessKey = keys.find((k) => k.type === KeyType.ACCESS)?.key;

  // Added check for 'Too many' just in case the unique constraint failed due to external factors
  if (keys.length > 2) {
    return {
      refreshKey,
      accessKey,
      error: true,
      message: "Too many keys found (DB error)",
    };
  }

  return { refreshKey, accessKey, error: false };
}

// --- TOKEN GENERATION FUNCTIONS ---

export async function createAccessKey(userId: number): Promise<TokenResult> {
  const accessExpiration = Math.floor(Date.now() / 1000) + 5 * 60;
  const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

  const accessToken = await safeExecute(() =>
    new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(accessExpiration)
      .sign(secret)
  );

  if (!accessToken) {
    return { success: false };
  }

  const accessExpirationDate = new Date(accessExpiration * 1000).toISOString();

  const inserted = await insertKeyInDb(
    accessToken,
    userId,
    accessExpirationDate,
    "access"
  );

  return { success: inserted, token: accessToken };
}

export async function createRefreshKey(userId: number): Promise<TokenResult> {
  const refreshExpiration =
    Math.floor(Date.now() / 1000) + 2 * 30 * 24 * 60 * 60;
  const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

  const refreshToken = await safeExecute(() =>
    new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(refreshExpiration)
      .sign(secret)
  );

  if (!refreshToken) {
    return { success: false };
  }

  const refreshExpirationDate = new Date(
    refreshExpiration * 1000
  ).toISOString();

  const inserted = await insertKeyInDb(
    refreshToken,
    userId,
    refreshExpirationDate,
    "refresh"
  );

  return { success: inserted, token: refreshToken };
}

// --- UTILITY/VALIDATION FUNCTIONS ---

export async function tokenExpirationDateValidation(
  token: string
): Promise<boolean> {
  // getExpirationDate is assumed to return null if token is expired/invalid
  const tokenDate = await getExpirationDate(token);
  return !!tokenDate;
}

// --- MAIN HANDLER FUNCTION (Centralized Flow Control) ---

export async function handleReadKeysFromDb(
  userId: number
): Promise<
  NextResponse<{ refreshToken?: string; accessToken?: string; message: string }>
> {
  const {
    refreshKey,
    accessKey,
    error,
    message: dbErrorMessage,
  } = await readKeysFromDb(userId);

  // 1. Initial Check for Database Read Error or Critical DB State
  if (error) {
    const msg = dbErrorMessage || "Internal server error reading user keys.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }

  // 2. Both Keys Missing: Create New Pair
  if (!refreshKey && !accessKey) {
    const [newRefresh, newAccess] = await Promise.all([
      createRefreshKey(userId),
      createAccessKey(userId),
    ]);

    if (newRefresh.success && newAccess.success) {
      return NextResponse.json(
        {
          refreshToken: newRefresh.token,
          accessToken: newAccess.token,
          message: "New key pair issued",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Failed to issue initial key pair" },
      { status: 500 }
    );
  }

  // --- At least one key exists from here ---

  let currentRefreshToken = refreshKey;
  let currentAccessToken = accessKey;

  // 3. Handle Missing Key Scenarios (Creates the missing key)
  if (!refreshKey) {
    const newRefresh = await createRefreshKey(userId);
    if (!newRefresh.success) {
      return NextResponse.json(
        { message: "Failed to create missing refresh token" },
        { status: 500 }
      );
    }
    currentRefreshToken = newRefresh.token;
  }
  if (!accessKey) {
    const newAccess = await createAccessKey(userId);
    if (!newAccess.success) {
      return NextResponse.json(
        { message: "Failed to create missing access token" },
        { status: 500 }
      );
    }
    currentAccessToken = newAccess.token;
  }

  // 4. Validate Keys (Both should now exist: currentRefreshToken and currentAccessToken)
  // Use non-null assertion since logic above ensures they are set if successful
  const [validRefresh, validAccess] = await Promise.all([
    tokenExpirationDateValidation(currentRefreshToken!),
    tokenExpirationDateValidation(currentAccessToken!),
  ]);

  // --- Validation Flow ---

  if (validRefresh && validAccess) {
    // Both valid: SUCCESS
    return NextResponse.json(
      {
        refreshToken: currentRefreshToken,
        accessToken: currentAccessToken,
        message: "Keys are valid",
      },
      { status: 200 }
    );
  } else if (!validRefresh) {
    // Refresh token is the primary gatekeeper. If invalid, treat as logout and issue new pair.
    // Delete existing tokens for security, though upsert in create functions handles overwriting.
    await deleteAllKeys(userId, "access");
    await deleteAllKeys(userId, "refresh");

    const [newRefresh, newAccess] = await Promise.all([
      createRefreshKey(userId),
      createAccessKey(userId),
    ]);

    if (newRefresh.success && newAccess.success) {
      return NextResponse.json(
        {
          refreshToken: newRefresh.token,
          accessToken: newAccess.token,
          message: "Invalid refresh token: new pair issued",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Failed to issue new key pair after invalid refresh token" },
      { status: 500 }
    );
  } else if (validRefresh && !validAccess) {
    // Refresh valid, Access invalid: Renew Access token
    // The createAccessKey already uses upsert to overwrite the invalid access token
    const newAccess = await createAccessKey(userId);
    if (newAccess.success) {
      return NextResponse.json(
        {
          refreshToken: currentRefreshToken,
          accessToken: newAccess.token,
          message: "Access token renewed",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Failed to renew access token" },
      { status: 500 }
    );
  }

  // 5. Final Fallback (Should be unreachable)
  return NextResponse.json(
    { message: "Unhandled authentication error" },
    { status: 500 }
  );
}

// NOTE: The Test function is no longer needed as the core logic is cleaner
// and readKeysFromDb now directly returns tokens using Prisma.
