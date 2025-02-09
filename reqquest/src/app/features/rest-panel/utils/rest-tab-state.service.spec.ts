import { TestBed } from '@angular/core/testing';

import { RestTabStateService } from './rest-tab-state.service';

describe('RestTabStateService', () => {
  let service: RestTabStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestTabStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
