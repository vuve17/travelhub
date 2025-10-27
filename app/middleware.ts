// 'use server'

// import { NextRequest, NextResponse } from "next/server";
// import { getUserId, getExpirationDate } from "./app/lib/auth";
// import { createAccessKey, createRefreshKey } from './app/lib/key-handlers';
// import { createToken } from './app/lib/types';


// async function handleAccessToken(accessToken: string, userIdFromExistingRefreshKey: string, request: NextRequest) {
//     const userIdFromExistingAccessKey = await getUserId(accessToken);
//     if (userIdFromExistingAccessKey) {
//         if(userIdFromExistingAccessKey != userIdFromExistingRefreshKey)
//         {
//             // console.log("different userIds")
//             return NextResponse.redirect(new URL('/login', request.url));
//         }
//         const accessExp = await getExpirationDate(accessToken);
//         if (accessExp && Date.now() < accessExp) {
//             return NextResponse.next();
//         } else {
//             const newAccessKey: createToken = await createAccessKey(userIdFromExistingRefreshKey);
//             // console.log(newAccessKey)
//             if(!newAccessKey.success)
//             {
//                 // console.log("accessKey creation error")
//                 return NextResponse.redirect(new URL('/login', request.url));
//             }
//                 return NextResponse.next();
//             }     
//         }

//     const newAccessKey : createToken = await createAccessKey(userIdFromExistingRefreshKey);
//     if (newAccessKey.success) {
//         return handleAccessToken(newAccessKey.token, userIdFromExistingRefreshKey, request);
//     }
//     // console.log('middleware error, access key creating error - sign in again');
//     return NextResponse.redirect(new URL('/login', request.url));
// }

// export async function middleware(request: NextRequest) {
//     try {
//         const refreshToken =  request.cookies.get('refreshToken')?.value;
//         const accessToken = request.cookies.get('accessToken')?.value;
//         if (!refreshToken) {
//             console.log('middleware error, refresh token doesn\'t exist');
//             return NextResponse.redirect(new URL('/login', request.url));
//         }

//         const userIdFromExistingRefreshKey = await getUserId(refreshToken);

//         if (!userIdFromExistingRefreshKey) {
//             console.log('middleware error, refresh token invalid');
//             return NextResponse.redirect(new URL('/login', request.url));
//         }

//         const refreshExp = await getExpirationDate(refreshToken);

//         if (!refreshExp || Date.now() >= refreshExp) {
//             console.log('refresh token expired - sign in again');
//             return NextResponse.redirect(new URL('/login', request.url));
//         }
//         if (accessToken) {
//             return await handleAccessToken(accessToken, userIdFromExistingRefreshKey, request);
//         } else {
//             console.log('log in Required');
//             return NextResponse.redirect(new URL('/login', request.url));
//         }
//     } catch (error) {
//         console.error('middleware error:', error);
//         return NextResponse.json({ message: "error" }, { status: 500 });
//     }
// }

// export const config = {
//     matcher: ['/scheduler', '/scheduler/:path*']
// }