import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CreateApiUserComponent } from "./create-api-user.component";

describe("CreateApiUserComponent", () => {
  let component: CreateApiUserComponent;
  let fixture: ComponentFixture<CreateApiUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateApiUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApiUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
