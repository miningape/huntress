import { z } from 'zod';

export const MaterialiseJob = z.object({
  name: z.string(),
  query: z.string(),
});

export type MaterialiseJob = z.infer<typeof MaterialiseJob>;

// {
//     name: "available_listings",
//     query: "materialise/available_listings.sql"
// }
