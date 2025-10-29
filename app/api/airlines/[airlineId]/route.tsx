'use server';

import prisma from "@/app/lib/prisma";
import { AirlineSubmissionType } from "@/app/types/airline-submission.type";
import { AirlineWithCountry } from "@/app/types/airline-with-country.type";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airlineId: string }> }
) {
  const { airlineId } = await params;
  const id = parseInt(airlineId);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid airline ID." }, { status: 400 });
  }

  try {
    const airline = (await prisma.airline.findUnique({
      where: { id: id },
      include: {
        baseCountry: true,
      },
    })) as AirlineWithCountry | null;

    if (!airline) {
      return NextResponse.json({ message: "Airline not found" }, { status: 404 });
    }

    return NextResponse.json(airline);
  } catch (error) {
    console.error("Error fetching airline:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching airline data." },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ airlineId: string }> }
) {
  const { airlineId } = await params;
  const id = parseInt(airlineId);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid airline ID in path." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as AirlineSubmissionType;
    const { name, baseCountryId, servicedAirportIds } = body;

    if (!name || !baseCountryId) {
      return NextResponse.json(
        { message: "Missing required fields for update (name, baseCountryId)." },
        { status: 400 }
      );
    }

    const baseCountryIdNum = Number(baseCountryId);
    if (isNaN(baseCountryIdNum) || baseCountryIdNum <= 0) {
      return NextResponse.json(
        { message: "Invalid Base Country ID." },
        { status: 400 }
      );
    }

    const currentAirline = await prisma.airline.findUnique({
      where: { id },
      select: { servicedAirports: { select: { id: true } } }
    });

    if (!currentAirline) {
      return NextResponse.json({ message: `Airline with ID ${id} not found.` }, { status: 404 });
    }

    const currentServicedIds = currentAirline.servicedAirports.map(a => a.id);

    const servicedAirportIdNums = servicedAirportIds ? servicedAirportIds.map(Number) : [];

    const removedAirportIds = currentServicedIds.filter(
      currentId => !servicedAirportIdNums.includes(currentId)
    );

    if (removedAirportIds.length > 0) {
      const conflictingRoutes = await prisma.route.findMany({
        where: {
          airlineId: id,
          OR: [
            { fromAirportId: { in: removedAirportIds } },
            { toAirportId: { in: removedAirportIds } },
          ],
        },
        select: {
          id: true,
          fromAirport: { select: { name: true, code: true } },
          toAirport: { select: { name: true, code: true } }
        },
        take: 1,
      });

      if (conflictingRoutes.length > 0) {
        const route = conflictingRoutes[0];
        return NextResponse.json(
          {
            message: `Cannot remove an airport that is part of an active route operated by this airline. Route ${route.fromAirport.name} (${route.fromAirport.code}) -> ${route.toAirport.name} (${route.toAirport.code}) prevents deletion.`
          },
          { status: 409 }
        );
      }
    }

    const airportUpdate = {
      servicedAirports: {
        set: servicedAirportIds
          ? servicedAirportIds.map(airportId => ({ id: Number(airportId) }))
          : [],
      },
    };

    const updatedAirline = await prisma.airline.update({
      where: { id: id },
      data: {
        name: name,
        baseCountryId: baseCountryIdNum,
        ...airportUpdate, // Spread the airport connection logic here
      },
      include: {
        baseCountry: true,
        servicedAirports: true,
      },
    });

    return NextResponse.json(updatedAirline, { status: 200 });

  } catch (error) {
    const errAny: any = error;

    if (errAny?.code === "P2025") {
      return NextResponse.json(
        { message: `Airline with ID ${id} not found.` },
        { status: 404 }
      );
    }

    if (errAny?.code === "P2002") {
      return NextResponse.json(
        { message: "Airline name is already in use by another airline." },
        { status: 409 }
      );
    }

    if (errAny?.code === 'P2003') {
      return NextResponse.json(
        { message: "Invalid ID provided for Base Country or Serviced Airport." },
        { status: 400 }
      );
    }

    console.error(`Error updating airline ID ${id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error during airline update." },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ airlineId: string }> }
) {
  const { airlineId } = await params;
  const id = parseInt(airlineId);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid airline ID." }, { status: 400 });
  }

  try {
    const deletedAirline = await prisma.airline.delete({
      where: { id: id },
    });

    return NextResponse.json(deletedAirline, { status: 200 });

  } catch (error) {
    const errAny: any = error;

    if (errAny?.code === 'P2025') {
      return NextResponse.json(
        { message: `Airline with ID ${id} not found.` },
        { status: 404 }
      );
    }

    if (errAny?.code === 'P2003') {
      return NextResponse.json(
        { message: "Cannot delete airline as it is currently operating routes." },
        { status: 409 }
      );
    }

    console.error(`Error deleting airline ID ${id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error during airline deletion." },
      { status: 500 }
    );
  }
}