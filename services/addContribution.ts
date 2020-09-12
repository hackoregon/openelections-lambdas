import { Repository } from 'typeorm';
import { ExternalContribution, IContributionSummary } from '../models/entity/ExternalContribution';
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

      let doGeocode = oaeContribution.address1 !== entry.address1
                     || oaeContribution.city !== entry.city
                     || oaeContribution.state !== entry.state
                     || oaeContribution.zip !== entry.zip
                     || (geoCode == null);

      if ((oaeContribution.address1.toLowerCase().includes('po box'))) {
        doGeocode = false;
      }

      let failedGeocoding = false;

      if (doGeocode) {
        try {
          const coordinates = await geocodeAddressAsync({
            address1: entry.address1,
            city: entry.city,
            state: entry.state,
            zip: entry.zip,
          });

          if (coordinates) {
            geoCode = {
              type: 'Point',
              coordinates,
            };
            Object.assign(oaeContribution, {
              addressPoint: geoCode,
            });
          }
          await contributionRepo.save(oaeContribution);
        } catch (error) {
          failedGeocoding = true;
          reportError(error);
        }
      }
      if (failedGeocoding || orestarDataHasBeenUpdated) {
        await contributionRepo.save(oaeContribution);
      }
    }).catch(async (error) => {
      console.log(error);
      // find failed, this is an insert! row does not exist so we geocode.
      if (!oaeContribution.addressPoint) {
        try {
          const geoCode = await geocodeAddressAsync({
            address1: oaeContribution.address1,
            city: oaeContribution.city,
            state: oaeContribution.state,
            zip: oaeContribution.zip,
          });
          if (geoCode) {
            Object.assign(oaeContribution, {
              addressPoint: {
                type: 'Point',
                coordinates: geoCode,
              },
            });
          }
        } catch (err) {
          reportError(err);
        }
      }
      await contributionRepo.save(oaeContribution);
    });
  } else {
    console.log('not valid: ', oaeContribution);
  }
};
