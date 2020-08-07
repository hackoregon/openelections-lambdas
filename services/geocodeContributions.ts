/* eslint-disable consistent-return */
import * as fetch from 'node-fetch';
import { Contribution } from '@models/entity/Contribution';

export interface GoogleResult {
  results: [
    {
      address_components: [
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        },
        {
          long_name: string;
          short_name: string;
          types: string[];
        }
      ];
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
        location_type: string;
        viewport: {
          northeast: {
            lat: number;
            lng: number;
          };
          southwest: {
            lat: number;
            lng: number;
          };
        };
      };
      place_id: number;
      types: string[];
    }
  ];
  status: string;
}

async function geocodeAddressAsync(attrs: {
  address1: string;
  city: string;
  state: string;
  zip: string;
}): Promise<[number, number] | undefined> {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  const address1 = attrs.address1.replace(/\s/g, '+');

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address1},+${attrs.city},+${attrs.state},+${attrs.zip}&key=${process.env.GOOGLE_GIS_KEY}`;
  const request = await fetch(url);
  if (request.ok) {
    const json = await request.json() as GoogleResult;
    if (json.status === 'OK' && json.results[0]) {
      return [json.results[0].geometry.location.lng, json.results[0].geometry.location.lat];
    }
  } else {
    throw new Error('Error geocoding');
  }
}

// Google's API for geocoding has a 50 QPS limit. Using half that just to be safe.
const MAX_QUERIES_PER_SEC = 25;

/**
 * Batches the geocoding of multiple contributions.
 * NOTE: modifies original objects.
 */
export async function geocodeContributions(contributions: Contribution[]): Promise<Contribution[]> {
  const geocodedContributions = [];

  let lastQueryTime = Date.now() - 1000; // a second ago
  let batchesQueried = 0;

  while (geocodedContributions.length !== contributions.length) {
    const secondHasPassedSinceLastQuery = Date.now() - lastQueryTime > 1000;
    if (secondHasPassedSinceLastQuery) {
      const lastQueryIndex = MAX_QUERIES_PER_SEC * batchesQueried;

      // send next batch of geocoding queries
      contributions.slice(lastQueryIndex, lastQueryIndex + MAX_QUERIES_PER_SEC)
        .forEach(async (contribution) => {
          const {
            address1,
            city,
            state,
            zip,
          } = contribution;
          // eslint-disable-next-line no-param-reassign
          contribution.addressPoint = await geocodeAddressAsync({
            address1, city, state, zip,
          });
          geocodedContributions.push(contribution);
        });

      batchesQueried += 1;
      lastQueryTime = Date.now();
    }
  }
  return geocodedContributions;
}
