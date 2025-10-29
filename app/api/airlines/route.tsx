'use server';

import prisma from "@/app/lib/prisma";
import { AirlineSubmissionType } from "@/app/types/airline-submission.type";
import { AirlineWithCountry } from "@/app/types/airline-with-country.type";
import { NextRequest, NextResponse } from "next/server";
;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const pageParam = searchParams.get('page');
  const perPageParam = searchParams.get('perPage');

  if (!pageParam || !perPageParam) {
    try {
      const allAirlines: AirlineWithCountry[] = await prisma.airline.findMany({
        include: {
          baseCountry: true,
        },
        orderBy: {
          name: 'asc',
        }
      });

      return NextResponse.json(allAirlines, { status: 200 });

    } catch (error) {
      console.error("Error fetching all airlines (non-paginated):", error);
      return NextResponse.json(
        { message: "Internal Server Error fetching all airlines list." },
        { status: 500 }
      );
    }
  }

  const countryIdParam = searchParams.get('countryId');
  const countryId = countryIdParam ? parseInt(countryIdParam) : null;

  const page = parseInt(pageParam as string);
  const perPage = parseInt(perPageParam as string);
  const skip = (page - 1) * perPage;

  try {
    const whereClause: any = {};

    if (countryId && countryId > 0) {
      whereClause.baseCountryId = countryId;
    }

    const airlines: AirlineWithCountry[] = await prisma.airline.findMany({
      take: perPage,
      skip: skip,
      where: whereClause,
      include: {
        baseCountry: true,
      },
      orderBy: {
        name: 'asc',
      }
    });

    const totalCount = await prisma.airline.count({
      where: whereClause,
    });

    // 5. Vraćanje odgovora s ukupnim brojem u headeru
    return new NextResponse(JSON.stringify(airlines), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': totalCount.toString(),
        'Access-Control-Expose-Headers': 'X-Total-Count',
      },
    });

  } catch (error) {
    console.error("Error fetching paginated airlines:", error);
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

    if (errAny?.code === 'P2003') {
      return NextResponse.json({ message: "Invalid ID provided for Country or Airport (Foreign Key constraint failed)." }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Internal Server Error during airline creation." },
      { status: 500 }
    );
  }
}