import { makeEnvironmentProviders } from '@angular/core';

export function provideTrpcClient() {
  return makeEnvironmentProviders([]);
}
