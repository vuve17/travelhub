import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { AirportWithCountry } from "@/app/types/airport-with-country.type";
import { CreateAirportData } from "@/app/types/create-airport-data.type";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAirportData;

    if (!body.name || !body.code || !body.countryId || body.latitude === undefined || body.longitude === undefined) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const countryIdNum = Number(body.countryId);
    if (isNaN(countryIdNum) || countryIdNum <= 0) {
      return NextResponse.json({ message: "Invalid Country ID." }, { status: 400 });
    }

    const newAirport = await prisma.airport.create({
      data: {
        name: body.name,
        code: body.code,
        city: body?.city || '',
        countryId: countryIdNum,
        latitude: body.latitude,
        longitude: body.longitude,
      },
      include: {
        country: true,
      },
    });

    return NextResponse.json(newAirport, { status: 201 });

  } catch (error) {
    console.error("Error creating airport:", error);

    const errAny: any = error;
    if (errAny?.code === 'P2002') {
      return NextResponse.json({ message: "Airport code is already in use." }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Internal Server Error during airport creation." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const airports = (await prisma.airport.findMany({
      include: {
        country: true,
      },
      orderBy: {
        name: 'asc',
      }
    })) as AirportWithCountry[];

    return NextResponse.json(airports);

  } catch (error) {
    console.error("Error fetching all airports:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching airports list." },
      { status: 500 }
    );
  }
}