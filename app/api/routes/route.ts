import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { RouteWithRelations } from "@/app/types/route-with-relations.type";
import { CreateRouteType } from "@/app/types/create-route.type";
import { ItineraryWithRoutes } from "@/app/types/Itinerary.type";
import { estimateFlightTime } from "@/app/lib/haversine-formula";


// export async function GET() {
//   try {
//   const routes: RouteWithRelations[] = await prisma.route.findMany({
//     include: {
//       operator: true,
//       fromAirport: {
//         include: {
//           country: true,
//         },
//       },
//       toAirport: {
//         include: {
//           country: true,
//         },
//       },
//     },
//     orderBy: {
//       id: 'asc',
//     },
//   })

//     return NextResponse.json(routes);

//   } catch (error) {
//     console.error("Error fetching all routes:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error fetching routes list." },
//       { status: 500 }
//     );
//   }
// }


export async function GET() {
  try {
    // Dohvati sve itinerare
    const itineraries: ItineraryWithRoutes[] = await prisma.itinerary.findMany({
      include: {
        // Uključi sve segmente koji čine itinerar
        segments: {
          // Osiguraj ispravan redoslijed segmenata rute (1, 2, 3...)
          orderBy: {
            order: 'asc',
          },
          include: {
            // Uključi detalje same rute za svaki segment
            route: {
              include: {
                // Uključi operatera (Airline)
                operator: true,
                // Uključi polazni aerodrom i njegovu državu
                fromAirport: {
                  include: {
                    country: true,
                  },
                },
                // Uključi dolazni aerodrom i njegovu državu
                toAirport: {
                  include: {
                    country: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(itineraries);

  } catch (error) {
    console.error("Error fetching all itineraries:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching itineraries list." },
      { status: 500 }
    );
  }
}



export async function POST(request: Request) {
  try {
    const body: CreateRouteType = (await request.json());

    if (!body.fromAirportId || !body.toAirportId || !body.airlineId) {
      return NextResponse.json({ message: "Missing required route fields." }, { status: 400 });
    }

    const { fromAirportId, toAirportId, airlineId } = body;

    if (fromAirportId === toAirportId) {
        return NextResponse.json({ message: "Route cannot start and end at the same airport." }, { status: 400 });
    }
    
    // 1. DOHVAĆANJE GEO-KOORDINATA
    const [fromAirport, toAirport] = await prisma.$transaction([
        prisma.airport.findUnique({ where: { id: fromAirportId }, select: { latitude: true, longitude: true } }),
        prisma.airport.findUnique({ where: { id: toAirportId }, select: { latitude: true, longitude: true } }),
    ]);

    if (!fromAirport || !toAirport) {
         return NextResponse.json({ message: "One or both airport IDs are invalid." }, { status: 404 });
    }
    
    // 2. PRORAČUN VREMENA LETA
    const flightTime = estimateFlightTime(
      { lat: fromAirport.latitude, lng: fromAirport.longitude }, 
      { lat: toAirport.latitude, lng: toAirport.longitude }
    );
    const durationMin = flightTime.totalMinutes;
  

    // 3. KREIRANJE RUTE, ITINERARA I SEGMENTA U JEDNOJ TRANSAKCIJI
    // Transakcija osigurava da se SVE operacije završe uspješno,
    // ili se NIJEDNA ne izvrši.
    const [newRoute, newItinerary, newSegment] = await prisma.$transaction(async (tx) => {
        
        // a) Kreiraj novu Rutu
        const route = await tx.route.create({
            data: {
                fromAirportId,
                toAirportId,
                airlineId,
            },
            include: {
                operator: { select: { id: true, name: true } },
                fromAirport: { select: { id: true, code: true, name: true, country: { select: { name: true } } } },
                toAirport: { select: { id: true, code: true, name: true, country: { select: { name: true } } } },
            },
        });
        
        // b) Kreiraj Itinerar povezan s Rutom
        const itinerary = await tx.itinerary.create({
            data: {
                name: `Itinerary for ${route.fromAirport.code}-${route.toAirport.code}`,
                totalDurationMin: durationMin,
            }
        });

        // c) Kreiraj Segment koji povezuje Rutu i Itinerar
        const segment = await tx.itinerarySegment.create({
            data: {
                itineraryId: itinerary.id,
                routeId: route.id,
                order: 1,
            }
        });
        
        return [route, itinerary, segment];
    });


    // Vrati kreiranu Rutu (ili Itinerar, ovisno što je primarno za frontend)
    // Ovdje vraćamo novu rutu, ali uključujemo i ID itinerara ako je potrebno.
    return NextResponse.json(
        {
            ...newRoute, 
            itineraryId: newItinerary.id, 
            calculatedDurationMin: durationMin
        }, 
        { status: 201 }
    );

  } catch (error) {
    console.error("Error creating route/itinerary:", error);

    const errAny: any = error;
    
    // P2002: Unique constraint violation (rutu već postoji)
    if (errAny?.code === 'P2002') {
      return NextResponse.json({ message: "This route already exists." }, { status: 409 });
    }
    // P2003: Foreign key constraint violation (Airport/Airline ID ne postoji)
    if (errAny?.code === 'P2003') {
        return NextResponse.json({ message: "One or more provided IDs (Airport or Airline) do not exist." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Internal Server Error during route/itinerary creation." },
      { status: 500 }
    );
  }
}