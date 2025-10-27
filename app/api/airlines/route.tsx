'use server';

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { AirlineWithCountry } from "@/app/types/airline-with-country.type";
import { AirlineSubmissionType } from "@/app/types/airline-submission.type";

export async function GET() {
  try {
    const airlines: AirlineWithCountry[] = await prisma.airline.findMany({
      include: {
        baseCountry: true,
      },
      orderBy: {
        name: 'asc',
      }
    })

    return NextResponse.json(airlines);

  } catch (error) {
    console.error("Error fetching all airlines:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching airlines list." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AirlineSubmissionType;

    const { name, baseCountryId, servicedAirportIds } = body;

    if (!name || !baseCountryId) {
      return NextResponse.json({ message: "Missing required fields (name, baseCountryId)." }, { status: 400 });
    }

    const baseCountryIdNum = Number(baseCountryId);
    if (isNaN(baseCountryIdNum) || baseCountryIdNum <= 0) {
      return NextResponse.json({ message: "Invalid Base Country ID format." }, { status: 400 });
    }

    const airportConnect = (servicedAirportIds && servicedAirportIds.length > 0)
      ? {
        servicedAirports: {
          connect: servicedAirportIds.map(id => ({ id: Number(id) })),
        }
      }
      : {};

    const newAirline = await prisma.airline.create({
      data: {
        name: name,
        baseCountryId: baseCountryIdNum,
        ...airportConnect,
      },
      include: {
        baseCountry: true,
        servicedAirports: true,
      },
    });

    return NextResponse.json(newAirline, { status: 201 });

  } catch (error) {
    console.error("Error creating airline:", error);

    const errAny: any = error;
    if (errAny?.code === 'P2002') {
      return NextResponse.json({ message: "Airline name is already in use." }, { status: 409 });
    }

    // P2003 now covers both invalid Country ID and invalid Airport ID
    if (errAny?.code === 'P2003') {
      return NextResponse.json({ message: "Invalid ID provided for Country or Airport (Foreign Key constraint failed)." }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal Server Error during airline creation." },
      { status: 500 }
    );
  }
}