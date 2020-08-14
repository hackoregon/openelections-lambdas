import Bugsnag from '@bugsnag/js';

export function reportError(error: Error): void {
  console.log(error);
  if (process.env.NODE_ENV !== 'test') {
    Bugsnag.start({
      apiKey: process.env.BUG_SNAG_API_KEY,
      releaseStage: process.env.APP_ENV,
    });
    Bugsnag.notify(error);
  }
}
