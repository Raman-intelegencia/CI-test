import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposeComponent } from './compose.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ThreadsService } from '@amsconnect/shared';

describe('ComposeComponent', () => {
  let component: ComposeComponent;
  let fixture: ComponentFixture<ComposeComponent>;
  let threadService : ThreadsService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [ ComposeComponent,HttpClientModule,TranslateModule.forRoot(),HttpClientTestingModule,],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    threadService = TestBed.inject(ThreadsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should recive the selected data', (data) => {
    const messageData = data;
  });
});