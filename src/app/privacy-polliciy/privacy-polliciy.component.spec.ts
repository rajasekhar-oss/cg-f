import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolliciyComponent } from './privacy-polliciy.component';

describe('PrivacyPolliciyComponent', () => {
  let component: PrivacyPolliciyComponent;
  let fixture: ComponentFixture<PrivacyPolliciyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolliciyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolliciyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
