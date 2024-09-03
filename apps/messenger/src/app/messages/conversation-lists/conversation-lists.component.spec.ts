import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationListsComponent } from './conversation-lists.component';

describe('ConversationListsComponent', () => {
  let component: ConversationListsComponent;
  let fixture: ComponentFixture<ConversationListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversationListsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
