import { ExternalContribution, IContributionSummary } from '../models/entity/ExternalContribution';
import { Repository } from 'typeorm';
import { geocodeAddressAsync } from './geocodeContributions';
import { reportError } from './bugSnag';

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
      let failedGeocoding = false;
      if (doGeocode) {
        try {
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
          if (doGeocode || orestarDataHasBeenUpdated) {
            Object.assign(oaeContribution, {
              addressPoint: geoCode,
            });
            await contributionRepo.save(oaeContribution);
          }
        } catch (error) {
          failedGeocoding = true;
          reportError(error);
        }
      }
      if (failedGeocoding) {
        await contributionRepo.save(oaeContribution);
      }
    }).catch(async () => {
      // find failed, this is an insert! row does not exist so we geocode.
      try {
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
      } catch (error) {
        reportError(error);
      }
      await contributionRepo.save(oaeContribution);
    });
  }
};
