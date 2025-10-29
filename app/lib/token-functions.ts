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

// 