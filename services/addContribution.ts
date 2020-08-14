import { ExternalContribution, IContributionSummary } from '@models/entity/ExternalContribution';
import { Repository } from 'typeorm';
import { geocodeAddressAsync } from './geocodeContributions';

export default async (contribution: IContributionSummary, contributionRepo: Repository<unknown>): Promise<void> => {
  const oaeContribution = new ExternalContribution();
  Object.assign(oaeContribution, contribution);

  if (await oaeContribution.isValidAsync()) {
    await contributionRepo.findOneOrFail(oaeContribution.orestarOriginalId).then(async (entry: ExternalContribution) => {
      if (entry.addressPoint) {
        return;
      }
      console.log('starting geocode process');
      // TODO: check for no geocode response
      const geoCode = await geocodeAddressAsync({
        address1: entry.address1,
        city: entry.city,
        state: entry.state,
        zip: entry.zip,
      });
      if (geoCode) {
        await contributionRepo.update(oaeContribution.orestarOriginalId, {
          addressPoint: {
            type: 'Point',
            coordinates: geoCode,
          },
        });
      }
    }).catch(async () => {
      // find failed, this is an insert! row does not exist so we geocode.
      const geoCode = await geocodeAddressAsync({
        address1: oaeContribution.address1,
        city: oaeContribution.city,
        state: oaeContribution.state,
        zip: oaeContribution.zip,
      });
      Object.assign(oaeContribution, {
        addressPoint: {
          type: 'Point',
          coordinates: geoCode,
        },
      });
      await contributionRepo.save(oaeContribution);
    });
  }
};
