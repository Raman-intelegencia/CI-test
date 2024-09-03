import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReportingTagsComponent } from "./reporting-tags.component";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";

describe("ReportingTagsComponent", () => {
  let component: ReportingTagsComponent;
  let fixture: ComponentFixture<ReportingTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule,TranslateModule.forRoot()],
      declarations: [ReportingTagsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportingTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it('should add a new tag', () => {
    const initialTagsCount = component.tags.length;
    const newTag = 'New Tag';

    component.reportingTagForm.controls['tag'].setValue(newTag);
    component.savetags();

    expect(component.tags.length).toBe(initialTagsCount + 1);
    expect(component.tags).toContain(newTag);
  });

  it('should delete a tag', () => {
    const tagToDelete = 'TagToDelete'; 
    component.tags.push(tagToDelete);

    component.deleteReportingTag(tagToDelete);

    expect(component.tags).not.toContain(tagToDelete);
  });

  it('should edit a tag', () => {
    const indexToEdit = 0;
    const newTagValue = 'Edited Tag';

    component.tags = ['Tag1', 'Tag2', 'Tag3'];
    component.editValueAtIndex(indexToEdit);

    expect(component.isEditing).toBe(true);
    expect(component.selectedIndex).toBe(indexToEdit);

    component.editedValue = newTagValue;
    component.saveEditedValue();

    expect(component.isEditing).toBe(false);
    expect(component.tags[indexToEdit]).toBe(newTagValue);
  });

  it('should save reporting tags in list-view mode', () => {
    const initialTags = ['Tag1', 'Tag2', 'Tag3'];

    component.reporting_active_status = component.viewType.List;
    component.tags = initialTags;

    component.saveReportingTags(); 
    
  });

  it('should save reporting tags in another mode', () => {
    const newTagInput = 'NewTag1\nNewTag2\nNewTag3';

    component.reporting_active_status = component.viewType.FreeText;
    component.newTagInput = newTagInput;

    component.saveReportingTags();
  
  });

});
