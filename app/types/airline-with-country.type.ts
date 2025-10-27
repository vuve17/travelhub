import { Prisma } from '@prisma/client';

export type AirlineWithCountry = Prisma.AirlineGetPayload<{
  include: {
    baseCountry: true;
  };
}>;