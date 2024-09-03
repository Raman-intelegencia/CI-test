import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigureUserChildOusComponent } from './configure-user-child-ous.component';

describe('ConfigureUserChildOusComponent', () => {
  let component: ConfigureUserChildOusComponent;
  let fixture: ComponentFixture<ConfigureUserChildOusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigureUserChildOusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigureUserChildOusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
