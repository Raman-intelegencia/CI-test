import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoComponent } from './user-info.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HumanizedDatePipe } from '@amsconnect/shared';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserInfoComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        HumanizedDatePipe,
        TranslateModule.forRoot(),
      ],
      providers: [TranslateService],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have webhookForm and sftpForm defined', () => {
    expect(component.webhookForm).toBeDefined();
    expect(component.sftpForm).toBeDefined();
  });

  it('forms should be invalid when initialized', () => {
    expect(component.webhookForm.valid).toBeFalsy();
    expect(component.sftpForm.valid).toBeFalsy();
  });

  it('should toggle edit modes correctly', () => {
    component.toggleEditMode();
    expect(component.isEditMode).toBeTruthy();

    component.toggleSftpEditMode();
    expect(component.isEditSftpMode).toBeTruthy();
  });

  it('should handle adding new SFTP data correctly', () => {
    component.addSftpAccess();
    expect(component.addingNewSftpData).toBeTruthy();
    expect(component.isEditSftpMode).toBeTruthy();
    expect(component.showSftpForm).toBeTruthy();
  });

  it('should cancel SFTP edit mode correctly', () => {
    component.addingNewSftpData = true;
    component.toggleSftpEditMode();
    expect(component.showSftpForm).toBeFalsy();
    expect(component.addingNewSftpData).toBeFalsy();
  });


});
