import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseNoteModelComponent } from './release-note-model.component';

describe('ReleaseNoteModelComponent', () => {
  let component: ReleaseNoteModelComponent;
  let fixture: ComponentFixture<ReleaseNoteModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReleaseNoteModelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseNoteModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
