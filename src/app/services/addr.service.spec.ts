import { TestBed } from '@angular/core/testing';

import { AddrService } from './addr.service';

describe('AddrService', () => {
  let service: AddrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
