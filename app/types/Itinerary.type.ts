import { Prisma } from "@prisma/client";

export type ItinerarySegmentWithRoute = Prisma.ItinerarySegmentGetPayload<{
  include: {
    route: {
      include: {
        operator: true;
        fromAirport: {
          include: {
            country: true;
          };
        };
        toAirport: {
          include: {
            country: true;
          };
        };
      };
    };
  };
}>;


export type ItineraryWithRoutes = Prisma.ItineraryGetPayload<{
  include: {
    segments: {
      orderBy: {
        order: 'asc';
      };
      include: {
        route: {
          include: {
            operator: true;
            fromAirport: {
              include: {
                country: true;
              };
            };
            toAirport: {
              include: {
                country: true;
              };
            };
          };
        };
      };
    };
  };
}>;