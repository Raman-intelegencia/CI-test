import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationListsDetailComponent } from './conversation-lists-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ConversationListsDetailComponent', () => {
  let component: ConversationListsDetailComponent;
  let fixture: ComponentFixture<ConversationListsDetailComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversationListsDetailComponent ],
      imports:[TranslateModule.forRoot(),HttpClientModule,HttpClientTestingModule, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationListsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it('should update userId and userType when userService emits values', () => {
    // Mock data
    const mockUserId = 'testId';
    const mockUserType = 'testType';
    
    // Mock userService behavior
    component.userService.userId$ = of(mockUserId); // Assuming 'of' from 'rxjs'
    component.userService.userType$ = of(mockUserType);
    
    component.getUserServiceData();
    
    expect(component.userId).toEqual(mockUserId);
    expect(component.userType).toEqual(mockUserType);
 });

});
