// "use server";

// import { getUserViaEmail } from "@/app/lib/user-functions";
// import { handleReadKeysFromDb } from "@/app/lib/token-functions";
// import { LoginParams } from "@/app/types/login.type";
// import bcrypt from "bcrypt";
// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";


// export async function POST(req: Request) {
//   const body = await req.json();
//   const { email, password }: LoginParams = await { ...body };
//   const user = await getUserViaEmail(email);

//   if (!user) {
//     return NextResponse.json({ message: "user not found" }, { status: 401 });
//   }

//   const match = await bcrypt.compare(password, user.password);

//   if (match) {
//     const response = await handleReadKeysFromDb(user.id);
//     return response;
//   } else {
//     return NextResponse.json({ message: "Wrong Password" }, { status: 401 });
//   }
// }