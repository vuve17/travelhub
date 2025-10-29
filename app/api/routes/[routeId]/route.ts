'use server';

import { estimateFlightTime } from "@/app/lib/haversine-formula";
import prisma from "@/app/lib/prisma";
import { CreateRouteType } from "@/app/types/create-route.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const id = parseInt(routeId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Route ID format." },
      { status: 400 }
    );
  }

  try {
    const route = await prisma.route.findUnique({
      where: {
        id,
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
    });

    if (!route) {
      return NextResponse.json(
        { message: `Route with ID ${id} not found.` },
        { status: 404 }
      );
    }

    // Vraćamo pronađenu rutu
    return NextResponse.json(route);
  } catch (error) {
    console.error(`Error fetching route ${id}:`, error);
    return NextResponse.json(
      { message: "Failed to fetch route data." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const id = parseInt(routeId);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid Route ID." }, { status: 400 });
  }

  try {
    const body: CreateRouteType = await request.json();
    const { fromAirportId, toAirportId, airlineId } = body;

    if (!fromAirportId || !toAirportId || !airlineId) {
      return NextResponse.json(
        { message: "Missing required route fields." },
        { status: 400 }
      );
    }

    if (fromAirportId === toAirportId) {
      return NextResponse.json(
        { message: "Origin and destination airports cannot be the same." },
        { status: 400 }
      );
    }

    const airline = await prisma.airline.findUnique({
      where: { id: airlineId },
      select: {
        servicedAirports: {
          where: {
            id: { in: [fromAirportId, toAirportId] },
          },
          select: { id: true },
        },
      },
    });

    if (!airline) {
      return NextResponse.json(
        { message: `Airline with ID ${airlineId} not found.` },
        { status: 404 }
      );
    }

    if (airline.servicedAirports.length !== 2) {
      return NextResponse.json(
        {
          message: `Airline does not service (one or both) provided airports`,
        },
        { status: 409 }
      );
    }

    // 3. Provjera da li nova ruta krši UNIQUE constraint (ako je promijenjen airlineId ili aerodromi)
    const existingRoute = await prisma.route.findUnique({
      where: {
        fromAirportId_toAirportId_airlineId: {
          fromAirportId,
          toAirportId,
          airlineId,
        },
      },
      select: { id: true },
    });

    if (existingRoute && existingRoute.id !== id) {
      return NextResponse.json(
        {
          message: "This route (Origin, Destination, Operator) already exists.",
        },
        { status: 409 }
      );
    }

    const fromAirport = await prisma.airport.findUnique({
      where: { id: fromAirportId },
      select: { latitude: true, longitude: true },
    });

    const toAirport = await prisma.airport.findUnique({
      where: { id: toAirportId },
      select: { latitude: true, longitude: true },
    });

    if (!fromAirport || !toAirport) {
      return NextResponse.json(
        { message: "One or both airport IDs are invalid." },
        { status: 404 }
      );
    }

    const flightTime = estimateFlightTime(
      { lat: fromAirport.latitude, lng: fromAirport.longitude },
      { lat: toAirport.latitude, lng: toAirport.longitude }
    );
    const totalDurationMin = flightTime.totalMinutes;

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: {
        fromAirportId,
        toAirportId,
        airlineId,
        totalDurationMin, // Ažurirano trajanje
      },
      include: {
        operator: true,
        fromAirport: { include: { country: true } },
        toAirport: { include: { country: true } },
      },
    });

    return NextResponse.json(updatedRoute);
  } catch (error: any) {
    console.error(`Error updating route ${id}:`, error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Route not found for update." },
        { status: 404 }
      );
    }
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "One or more provided IDs (Airport or Airline) do not exist.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error during route update." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const id = parseInt(routeId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid Route ID format for deletion." },
      { status: 400 }
    );
  }

  try {
    const deletedRoute = await prisma.route.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: `Route ${deletedRoute.id} successfully deleted.` },
      { status: 200 }
    );
  } catch (error) {
    const errAny: any = error;
    if (errAny?.code === "P2025") {
      return NextResponse.json(
        { message: "Route not found for deletion." },
        { status: 404 }
      );
    }

    console.error(`Error deleting route ${id}:`, error);
    return NextResponse.json(
      { message: "Failed to delete route." },
      { status: 500 }
    );
  }
}
