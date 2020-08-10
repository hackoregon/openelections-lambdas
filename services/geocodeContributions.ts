/* eslint-disable consistent-return */
import * as fetch from 'node-fetch';
import { ExternalContribution } from '@models/entity/ExternalContribution';
import { OrestarContribution } from './readXls';

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
  console.log('fetching:', url);
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
export async function geocodeContributions(contributions: OrestarContribution[]): Promise<OrestarContribution[]> {
  if (contributions.length === 0) return [];
  console.log('geocoding!', contributions.length);

  // create batches of MAX_QUERIES_PER_SEC Promises that fetch geocode data
  const batches: Promise<OrestarContribution>[][] = [];
  while (contributions.length !== 0) {
    batches.push(
      contributions.splice(0, MAX_QUERIES_PER_SEC).map((contribution) => new Promise((resolve) => {
        console.log('doing it!');
        const {
          address1,
          city,
          state,
          zip,
        } = contribution;

        return geocodeAddressAsync({
          address1,
          city,
          state,
          zip,
        }).then((addressPoint) => {
          // eslint-disable-next-line no-param-reassign
          contribution.addressPoint = addressPoint;
          console.log('data!', contribution.addressPoint);
          resolve(contribution);
        });
      })),
    );
  }

  const batchResults: OrestarContribution[][] = await Promise.all(
    batches.map((batch, i): Promise<OrestarContribution[]> => new Promise((resolve) => {
      setTimeout(async () => {
        console.log('sending batch ', i);
        const geocoded = await Promise.all(batch);
        resolve(geocoded);
      }, 1000 * i);
    })),
  );

  const geocodedContributions = batchResults.flat();

  console.log(geocodedContributions);

  console.log('done geocoding!!');

  return geocodedContributions;
}
