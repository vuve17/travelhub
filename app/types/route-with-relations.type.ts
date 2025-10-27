import { Prisma } from '@prisma/client';

export type RouteWithRelations = Prisma.RouteGetPayload<{
  include: {
    fromAirport: true,
    toAirport: true,
    operator: true
  };
}>;