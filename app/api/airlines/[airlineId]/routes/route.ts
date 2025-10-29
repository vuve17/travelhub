"use server";

import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airlineId: string }> }
) {
  const { airlineId } = await params;
  const id = parseInt(airlineId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Airline ID format." },
      { status: 400 }
    );
  }

  try {
    const airlineExists = await prisma.airline.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!airlineExists) {
      return NextResponse.json(
        { message: `Airline with ID ${id} not found.` },
        { status: 404 }
      );
    }

    const routes = await prisma.route.findMany({
      where: {
        operator:{
          id
        }
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
    console.error(`Error fetching routes for airline ${id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch route data for the airline." },
      { status: 500 }
    );
  }
}
