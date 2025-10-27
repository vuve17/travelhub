"use server";

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ airlineId: string }> }
) {
  const { airlineId } = await params;
  console.log("airlineId: ", airlineId)
  const id = parseInt(airlineId);
  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Airline ID format." },
      { status: 400 }
    );
  }
  try {
    const airlineWithAirports = await prisma.airline.findUnique({
      where: { id },
      include: {
        servicedAirports: {
          include: {
            country: true,
          },
        },
      },
    });

    return NextResponse.json(airlineWithAirports?.servicedAirports.length ? [...airlineWithAirports.servicedAirports] : [], { status: 200 });
  } catch (error) {
    console.error("Error fetching serviced airports:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
