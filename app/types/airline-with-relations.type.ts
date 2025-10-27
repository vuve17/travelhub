import { Prisma } from "@prisma/client";

export type AirlineWithRelations = Prisma.AirlineGetPayload<{
  include: {
    baseCountry: true;
    servicedAirports: true;
  };
}>;
