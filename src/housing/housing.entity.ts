import { z } from 'zod';

export const HousingEntry = z.object({
  case_number: z.string(),
  url: z.string(),

  address: z.string(),
  size: z.string(),

  type: z.string(),
  rooms: z.string(),
  floor: z.string(),
  furnished: z.string(),
  petsAllowed: z.string(),
  balcony: z.string(),
  washingMachine: z.string(),
  dishwasher: z.string(),
  elevator: z.string(),

  monthlyRent: z.number(),
  Aconto: z.optional(z.string()),
  deposit: z.string(),
  prepaidRent: z.optional(z.string()),
  moveInPrice: z.string(),
  availableFrom: z.string(),
  rentalPeriod: z.string(),
});

export type HousingEntry = z.infer<typeof HousingEntry>;
