import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { CreateRouteType } from "@/app/types/create-route.type";
import { RouteWithRelations } from "@/app/types/route-with-relations.type"; // Pretpostavljamo da je ovaj tip prilagođen novoj shemi
import { estimateFlightTime } from "@/app/lib/haversine-formula";

// 1. GET /api/routes
// Dohvaća sve rute s uključenim relacijama (Operator, Polazni/Dolazni aerodrom i njihove države).
export async function GET() {
  try {
    const routes: RouteWithRelations[] = await prisma.route.findMany({
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
        id: "asc",
      },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error("Error fetching all routes:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching routes list." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateRouteType = await request.json();

    if (!body.fromAirportId || !body.toAirportId || !body.airlineId) {
      return NextResponse.json(
        {
          message:
            "Missing required route fields (fromAirportId, toAirportId, airlineId).",
        },
        { status: 400 }
      );
    }

    const { fromAirportId, toAirportId, airlineId } = body;

    if (fromAirportId === toAirportId) {
      return NextResponse.json(
        { message: "Route cannot start and end at the same airport." },
        { status: 400 }
      );
    }

    const existingRoute = await prisma.route.findUnique({
      where: {
        fromAirportId_toAirportId_airlineId: {
          fromAirportId,
          toAirportId,
          airlineId,
        },
      },
    });

    if (existingRoute) {
      return NextResponse.json(
        { message: "This route already exists." },
        { status: 409 }
      );
    }
    console.log(1);

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
    console.log(2);

    const flightTime = estimateFlightTime(
      { lat: fromAirport.latitude, lng: fromAirport.longitude },
      { lat: toAirport.latitude, lng: toAirport.longitude }
    );
    const totalDurationMin = flightTime.totalMinutes;

    console.log(3, "time m: ", flightTime);
    const newRoute = await prisma.route.create({
      data: {
        fromAirportId,
        toAirportId,
        airlineId,
        totalDurationMin,
      },
      include: {
        operator: true,
        fromAirport: { include: { country: true } },
        toAirport: { include: { country: true } },
      },
    });

    // Vrati kreiranu Rutu
    return NextResponse.json(newRoute, { status: 201 });
  } catch (error) {
    console.error("Error creating route:", error);

    const errAny: any = error;

    // P2003: Foreign key constraint violation (Airport/Airline ID ne postoji)
    if (errAny?.code === "P2003") {
      return NextResponse.json(
        {
          message:
            "One or more provided IDs (Airport or Airline) do not exist.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error during route creation." },
      { status: 500 }
    );
  }
}
