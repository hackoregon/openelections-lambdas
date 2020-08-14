import { ExternalContribution, IContributionSummary } from '@models/entity/ExternalContribution';
import { Repository } from 'typeorm';
import { geocodeAddressAsync } from './geocodeContributions';

export default async (contribution: IContributionSummary, contributionRepo: Repository<unknown>): Promise<void> => {
  const oaeContribution = new ExternalContribution();
  Object.assign(oaeContribution, contribution);

  if (await oaeContribution.isValidAsync()) {
    await contributionRepo.findOneOrFail(oaeContribution.orestarOriginalId).then(async (entry: ExternalContribution) => {
      let geoCode = entry.addressPoint;

      // when orestar updates a record, they keep the original id but update the transaction id.
      const orestarDataHasBeenUpdated = oaeContribution.orestarTransactionId !== entry.orestarTransactionId;

      const doGeocode = oaeContribution.address1 !== entry.address1
                     || oaeContribution.city !== entry.city
                     || oaeContribution.state !== entry.state
                     || oaeContribution.zip !== entry.zip
                     || (geoCode == null);
      if (doGeocode) {
        const coordinates = await geocodeAddressAsync({
          address1: entry.address1,
          city: entry.city,
          state: entry.state,
          zip: entry.zip,
        });
        geoCode = {
          type: 'Point',
          coordinates,
        };
      }

      if (doGeocode || orestarDataHasBeenUpdated) {
        Object.assign(oaeContribution, {
          addressPoint: geoCode,
        });
        await contributionRepo.save(oaeContribution);
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
