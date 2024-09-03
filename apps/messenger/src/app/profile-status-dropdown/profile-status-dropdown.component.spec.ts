import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProfileStatusDropdownComponent } from "./profile-status-dropdown.component";

describe("ProfileStatusDropdownComponent", () => {
  let component: ProfileStatusDropdownComponent;
  let fixture: ComponentFixture<ProfileStatusDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileStatusDropdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ProfileStatusDropdownComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
