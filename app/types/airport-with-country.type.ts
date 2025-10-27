import { Prisma } from '@prisma/client';

export type AirportWithCountry = Prisma.AirportGetPayload<{
  include: {
    country: true;
  };
}>;