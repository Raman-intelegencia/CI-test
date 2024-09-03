import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoResponseModelComponent } from './auto-response-model.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('AutoResponseModelComponent', () => {
  let component: AutoResponseModelComponent;
  let fixture: ComponentFixture<AutoResponseModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports:[AutoResponseModelComponent, HttpClientModule,TranslateModule.forRoot(),HttpClientTestingModule,]
    }).compileComponents();

    fixture = TestBed.createComponent(AutoResponseModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('save auto response', () => {
    component.autoResponse = component.customAutoResponse;
    let currentValue = "custom";
    if (currentValue === "custom" && component.customAutoResponse !== currentValue) {
      component.customAutoResponse = currentValue;
    } else if (currentValue !== "custom") {
      component.customAutoResponse = "";
    }
     currentValue = "disable";
    if (currentValue === "disable") {
      component.autoResponse = "Disabled";
    }
    component.showAutoResponsePopup = false;
  });
});
