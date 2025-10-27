'use server';

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Country } from "@prisma/client";

export async function GET() {
  try {
    const countries: Country[] = await prisma.country.findMany({
      orderBy: {
        name: 'asc',
      }
    });

    return NextResponse.json(countries);

  } catch (error) {
    console.error("Error fetching all countries:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching countries list." },
      { status: 500 }
    );
  }
}