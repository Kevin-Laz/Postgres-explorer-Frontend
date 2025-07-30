import { TestBed } from '@angular/core/testing';

import { DatabaseContextService } from './database-context.service';

describe('DatabaseContextService', () => {
  let service: DatabaseContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaseContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
