import Bugsnag from '@bugsnag/js';

export function reportError(error: Error): void {
  console.log(error);
  if (process.env.NODE_ENV === 'production') {
    Bugsnag.start({
      apiKey: process.env.BUG_SNAG_API_KEY,
      releaseStage: process.env.NODE_ENV,
    });
    Bugsnag.notify(error);
  }
}
