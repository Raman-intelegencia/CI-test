import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CurrentScheduledServiceTeamComponent } from "./current-scheduled-service-team.component";

describe("CurrentScheduledServiceTeamComponent", () => {
  let component: CurrentScheduledServiceTeamComponent;
  let fixture: ComponentFixture<CurrentScheduledServiceTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentScheduledServiceTeamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentScheduledServiceTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
