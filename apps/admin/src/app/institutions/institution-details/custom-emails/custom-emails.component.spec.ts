import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CustomEmailsComponent } from "./custom-emails.component";

describe("CustomEmailsComponent", () => {
  let component: CustomEmailsComponent;
  let fixture: ComponentFixture<CustomEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomEmailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
