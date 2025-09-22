import { TestBed } from '@angular/core/testing';

import { EnviornmentsService } from './enviornments.service';

describe('EnviornmentsService', () => {
  let service: EnviornmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnviornmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
