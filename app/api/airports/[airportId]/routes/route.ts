"use server";

import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const { airportId } = await params;
  const id = parseInt(airportId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Airport ID format." },
      { status: 400 }
    );
  }

  try {
    const airportExists = await prisma.airport.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!airportExists) {
      return NextResponse.json(
        { message: `Airport with ID ${id} not found.` },
        { status: 404 }
      );
    }

    const routes = await prisma.route.findMany({
      where: {
        fromAirportId: id,
      },
      include: {
        operator: true,
        fromAirport: {
          include: {
            country: true,
          },
        },
        toAirport: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        toAirport: {
          code: "asc",
        },
      },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error(`Error fetching routes for airport ${id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch route data for the airport." },
      { status: 500 }
    );
  }
}
