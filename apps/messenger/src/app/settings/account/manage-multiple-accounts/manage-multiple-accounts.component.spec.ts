import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ManageMultipleAccountsComponent } from "./manage-multiple-accounts.component";

describe("ManageMultipleAccountsComponent", () => {
  let component: ManageMultipleAccountsComponent;
  let fixture: ComponentFixture<ManageMultipleAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageMultipleAccountsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMultipleAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should have initial values set correctly", () => {
    expect(component.loggedInUsersData).toBeUndefined();
    expect(component.storeMultipleAccountsData).toBeUndefined();
    expect(component.accountInformation).toEqual([]);
  });

  it("should retrieve data from localStorage and set accountInformation", () => {
    const mockMultipleAccData = {
      account_information: {
        1: { user: { _id: { $oid: "1" } } },
        2: { user: { _id: { $oid: "2" } } },
      },
    };
    localStorage.setItem("jStorage", JSON.stringify(mockMultipleAccData));

    component.getLoadLatestJournalIdData();

    expect(component.storeMultipleAccountsData).toEqual(mockMultipleAccData);
    expect(component.accountInformation).toEqual([
      { id: "1", user: { _id: { $oid: "1" } } },
      { id: "2", user: { _id: { $oid: "2" } } },
    ]);
  });

  it("should navigate to accounts screen", () => {
    const openSpy = jest.spyOn(window, "open");
    component.navigateToAccountsScreen();
    expect(openSpy).toHaveBeenCalledWith(
      "accounts_server_url_placeholder#/accounts/add",
      "_blank"
    );
    openSpy.mockRestore();
  });

  it("should remove user from accountInformation", () => {
    component.accountInformation = [
      { user: { _id: { $oid: "1" } } },
      { user: { _id: { $oid: "2" } } },
    ];
    component.removeUser("1");
    expect(component.accountInformation).toEqual([{ user: { _id: { $oid: "2" } } }]);
  });
});
