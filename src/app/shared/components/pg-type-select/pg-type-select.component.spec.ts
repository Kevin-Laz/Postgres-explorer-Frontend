import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgTypeSelectComponent } from './pg-type-select.component';

describe('PgTypeSelectComponent', () => {
  let component: PgTypeSelectComponent;
  let fixture: ComponentFixture<PgTypeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PgTypeSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
