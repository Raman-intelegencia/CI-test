import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ServiceTeamsPopUpComponent } from "./service-teams-pop-up.component";

describe("ServiceTeamsPopUpComponent", () => {
  let component: ServiceTeamsPopUpComponent;
  let fixture: ComponentFixture<ServiceTeamsPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceTeamsPopUpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceTeamsPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
