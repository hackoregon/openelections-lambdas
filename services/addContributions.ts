import db from '@models/db';
import { ExternalContribution } from '@models/entity/ExternalContribution';
import { OrestarContribution } from '@services/readXls';
import { geocodeAddressAsync } from './geocodeContributions';

export async function addContributions(contributions: OrestarContribution[]): Promise<void> {
  try {
    console.log('attempting to save');
    const connection = await db();
    const contributionRepository = connection.getRepository('external_contributions');

    console.log('have repository');
    await Promise.all(contributions.map(async (contribution: OrestarContribution) => {

      const oaeContribution = new ExternalContribution();
      Object.assign(oaeContribution, contribution);

      if (await oaeContribution.isValidAsync()) {
        await contributionRepository.findOneOrFail(oaeContribution.orestarOriginalId).then(async (entry: ExternalContribution) => {
          if (entry.addressPoint) {
            return
          } else {
            console.log('starting geocode process')
            const geoCode = await geocodeAddressAsync({
              address1: entry.address1,
              city: entry.city,
              state: entry.state,
              zip: entry.zip
            });
            if (geoCode) {
              await contributionRepository.update(oaeContribution.orestarOriginalId, {
                addressPoint: {
                  type: 'Point',
                  coordinates: geoCode
                }
              });
            }
          }
        }).catch(async () => {
          const geoCode = await geocodeAddressAsync({
            address1: oaeContribution.address1,
            city: oaeContribution.city,
            state: oaeContribution.state,
            zip: oaeContribution.zip
          });
          Object.assign(oaeContribution, {
            addressPoint: {
              type: 'Point',
              coordinates: geoCode
            }
          });
          await contributionRepository.save(oaeContribution);
        });
      }
    }));
  } catch (error) {
    // TODO: handle error
    console.log('error saving data!', error);
    throw error;
  }
}
