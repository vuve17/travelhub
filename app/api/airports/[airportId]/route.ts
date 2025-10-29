import prisma from "@/app/lib/prisma";
import { AirportWithCountry } from "@/app/types/airport-with-country.type";
import { CreateAirportData } from "@/app/types/create-airport-data.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const { airportId } = await params;
  const id = parseInt(airportId);

  if (isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid airport ID." },
      { status: 400 }
    );
  }

  try {
    const airport = (await prisma.airport.findUnique({
      where: { id },
      include: {
        country: true,
      },
    })) as AirportWithCountry | null;

    if (!airport) {
      return NextResponse.json(
        { message: "Airport not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(airport);
  } catch (error) {
    console.error("Error fetching airport:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching airport data." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const { airportId } = await params;
  if (!airportId) {
    return NextResponse.json(
      { message: "Invalid airport ID in path." },
      { status: 400 }
    );
  }
  const id = parseInt(airportId);

  try {
    const body = (await request.json()) as CreateAirportData;

    if (
      !body.name ||
      !body.code ||
      !body.city ||
      !body.countryId ||
      body.latitude === undefined ||
      body.longitude === undefined
    ) {
      return NextResponse.json(
        { message: "Missing required fields for update." },
        { status: 400 }
      );
    }

    const countryIdNum = Number(body.countryId);
    if (isNaN(countryIdNum) || countryIdNum <= 0) {
      return NextResponse.json(
        { message: "Invalid Country ID format." },
        { status: 400 }
      );
    }

    // 3. Update the Airport
    const updatedAirport = await prisma.airport.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        code: body.code,
        city: body.city,
        countryId: countryIdNum,
        latitude: body.latitude,
        longitude: body.longitude,
      },
      include: {
        country: true,
      },
    });

    return NextResponse.json(updatedAirport, { status: 200 });
  } catch (error) {
    // Note: The error message template is updated to use the correct variable `airportId`
    console.error(`Error updating airport ID ${id}:`, error);

    const errAny: any = error;

    if (errAny?.code === "P2025") {
      return NextResponse.json(
        { message: `Airport with ID ${id} not found.` },
        { status: 404 }
      );
    }

    if (errAny?.code === "P2002") {
      return NextResponse.json(
        { message: "Airport code is already in use by another airport." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error during airport update." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ airportId: string }> }
) {
  const { airportId } = await params;
  const id = parseInt(airportId);

  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { message: "Invalid airport ID." },
      { status: 400 }
    );
  }

  try {
    const deletedAirport = await prisma.airport.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(deletedAirport, { status: 200 });
  } catch (error) {
    const errAny: any = error;
    if (errAny?.code === "P2025") {
      return NextResponse.json(
        { message: `Airport with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error during airport deletion." },
      { status: 500 }
    );
  }
}
