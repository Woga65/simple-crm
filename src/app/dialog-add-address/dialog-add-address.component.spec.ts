import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddAddressComponent } from './dialog-add-address.component';

describe('DialogAddAddressComponent', () => {
  let component: DialogAddAddressComponent;
  let fixture: ComponentFixture<DialogAddAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddAddressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
