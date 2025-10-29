// "use server";

// import prisma  from "../lib/prisma";
// import { User } from "../generated/prisma";

// export async function getUserViaEmail(email: string): Promise<User | null> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         email: email.toLowerCase(),
//       },
//     });
//     return user;
//   } catch (error) {
//     console.error("Error fetching user by email:", error);
//     throw new Error("Failed to fetch user from the database.");
//   }
// }
