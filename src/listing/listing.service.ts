import { Injectable } from '@nestjs/common';
import { HousingEntry } from 'src/housing/housing.entity';
import { PipelineDestination } from 'src/pipeline/pipeline.destination';
import { PrismaService } from 'src/prisma/prisma.service';
import { Readable } from 'stream';

@Injectable()
export class ListingService implements PipelineDestination {
  constructor(private readonly prisma: PrismaService) {}

  async pipe(stream: Readable): Promise<void> {
    for await (const item of stream) {
      const result = HousingEntry.safeParse(item);

      if (result.success === false) {
        console.log(result.error.toString());
        continue;
      }

      const {
        case_number,
        url,
        address,
        size,
        type,
        rooms,
        floor,
        furnished,
        petsAllowed,
        balcony,
        washingMachine,
        dishwasher,
        elevator,
        monthlyRent,
        Aconto,
        deposit,
        prepaidRent,
        moveInPrice,
        availableFrom,
        rentalPeriod,
      } = result.data;

      const listing = await this.prisma.boligPortalListing.findUnique({
        where: {
          case_number: result.data.case_number,
        },
      });

      if (listing === null) {
        await this.prisma.boligPortalListing.create({
          data: {
            case_number,
            url,
            listing: {
              create: {
                address,
                size,
                type,
                rooms,
                floor,
                furnished,
                petsAllowed,
                balcony,
                washingMachine,
                dishwasher,
                elevator,
                monthlyRent,
                Aconto,
                deposit,
                prepaidRent,
                moveInPrice,
                availableFrom,
                rentalPeriod,
              },
            },
          },
        });

        continue;
      }

      await this.prisma.boligPortalListing.update({
        where: {
          id: listing.id,
        },
        data: {
          url,
          listing: {
            updateMany: {
              where: {
                bolig_portal_listing_id: listing.id,
              },
              data: {
                updated_at: new Date(),
                address,
                size,
                type,
                rooms,
                floor,
                furnished,
                petsAllowed,
                balcony,
                washingMachine,
                dishwasher,
                elevator,
                monthlyRent,
                Aconto,
                deposit,
                prepaidRent,
                moveInPrice,
                availableFrom,
                rentalPeriod,
              },
            },
          },
        },
      });
    }
  }
}
