export interface AirlineSubmissionType {
  id?: number;
  name: string;
  baseCountryId: number;
  servicedAirportIds?: number[];
}
