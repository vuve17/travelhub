"use server";

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { AirlineWithCountry } from "@/app/types/airline-with-country.type";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ airportId: string }> }
): Promise<NextResponse<AirlineWithCountry[]>> {
  const { airportId } = await params;
  const id = parseInt(airportId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Airport ID format." },
      { status: 400 }
    );
  }

  try {
    const airportWithAirlines = await prisma.airport.findUnique({
      where: {
        id,
      },
      include: {
        servicingAirlines: {
          include: {
            baseCountry: true,
          },
        },
      },
    });

    return NextResponse.json(airportWithAirlines ? [...airportWithAirlines?.servicingAirlines] : []);
  } catch (error) {
    console.error(`Error fetching airlines for airport ${airportId}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error fetching related airlines." },
      { status: 500 }
    );
  }
}
