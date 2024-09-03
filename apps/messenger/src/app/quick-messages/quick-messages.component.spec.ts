import { ComponentFixture, TestBed } from "@angular/core/testing";
import { QuickMessagesComponent } from "./quick-messages.component";
import { ThreadsService } from "@amsconnect/shared";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";

describe("QuickMessagesComponent", () => {
  let component: QuickMessagesComponent;
  let fixture: ComponentFixture<QuickMessagesComponent>;
  let threadService : ThreadsService;
  let httpTestingController: HttpTestingController;
  let  titles= [
    "Medical Student","Intern", "Resident","Chief Resident","Fellow","Attending","Physician","Assistant Professor","Associate Professor","Professor","Physician Assistant", "Medical Assistant","Nursing Student","Nurse","Nurse Practitioner","Nurse Manager","Charge Nurse","Bed Nurse","Pharmacist",
    "Occupational Therapist","Physical Therapist","Audiologist","Speech Therapist","Dietitian","Care Manager","Social Worker","Executive","Coordinator","Director","Supervisor","Administrative Assistant","Secretary","IT","Other"]
    let specialties =[
      "Adolescent Medicine","Allergy / Immunology","Anesthesiology","Cardiology","Communications","Dentistry","Dermatology","Emergency Medicine","Endocrinology / Diabetes","Family / General Practice",
      "Gastroenterology","Geriatrics","Hematology","Hospitalist", "Infectious Disease","Informatics","Internal Medicine","Interventional Radiology","Liver Diseases","Medical Genetics",
      "Medical School","Medicine-Pediatrics","Nephrology","Neurology","Neurosurgery","Nursing","Obstetrics / Gynecology","Occupational Therapy","Oncology","Ophthalmology","Orthopedics","Otolaryngology","Pathology","Patient Care","Pediatrics","Pharmacy",
      "Physical Medicine / Rehab","Physical Therapy", "Physician Assistant","Plastic Surgery","Podiatry", "Preventive Medicine", "Psychiatry","Pulmonology","Radiation Oncology","Radiology","Research","Rheumatology","Social Worker","Speech-Language Pathology","Surgery","Urology","Other MD/DO","Other Healthcare"]
  const errorMessage = 'An error occurred'; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ QuickMessagesComponent,HttpClientModule,TranslateModule.forRoot(),HttpClientTestingModule,],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    threadService = TestBed.inject(ThreadsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

    
  it('get the quick messages',()=>{
    let dummyData :QuickMessagesResponse = {   
      "status": "ok",
      "macros":[
        {
            "id": "64e6a2ce535621f5605bbf21",
            "body": "abcd"
        },
        {
            "id": "64e6ce07535621f5605bc0f8",
            "body": "Good Morninggg"
        }
    ],
      "titles": titles,
      "specialties": specialties,
      "time_updated": 1692849090208,
      "refresh_period": 300
      };
    threadService.getQuickMessage().subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });       
  })

  it('create the quick messages',()=>{
    let PayloadCreatedata  ={
      "a":"AGcH-9ZZdlzHAgfzPxtRnl9LOFR-HGpzzI_W0eW9OeuTHtHTV_kbT7WwyNlo96BbiD8QV7sCj2cFsCRdnyMkPnrkh7zlxqzEyRR-d4gFHCVaQ63aMRMOdmmnI4XGYJJ9vwpcFH3Q18Y9lC7fzoY027hRlQXxEkL4Wg|64e68311dbb490d58aacbc9d",
      "macros":[{"body":"My","id":""},{"id":"64e6a2ce535621f5605bbf21","body":"abcd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}]
    }
    let dummyData :QuickMessagesResponse = {   
      "status": "ok",
      "macros":[
        {  "id": "64e6a2ce535621f5605bbf21",  "body": "abcd" },
        { "id": "64e6ce07535621f5605bc0f8","body": "Good Morninggg"},
        {"body":"My","id":"64e6ce07535621f5605bc0fl"}
    ],
      "titles": titles,
      "specialties": specialties,
      "time_updated": 1692849090208,
      "refresh_period": 300
      };
    threadService.updateQuickMessage(PayloadCreatedata).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });    
  })

  it('edit the quick messages',()=>{
    let PayloadEditdata  ={
      "a":"AGcH-9ZZdlzHAgfzPxtRnl9LOFR-HGpzzI_W0eW9OeuTHtHTV_kbT7WwyNlo96BbiD8QV7sCj2cFsCRdnyMkPnrkh7zlxqzEyRR-d4gFHCVaQ63aMRMOdmmnI4XGYJJ9vwpcFH3Q18Y9lC7fzoY027hRlQXxEkL4Wg|64e68311dbb490d58aacbc9d",
      "macros":[{"id":"64e6a2ce535621f5605bbf21","body":"abcdd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}]
    }
    let dummyData :QuickMessagesResponse = {   
      "status": "ok",
      "macros":[
        {  "id": "64e6a2ce535621f5605bbf21",  "body": "abcdd" },
        { "id": "64e6ce07535621f5605bc0f8","body": "Good Morninggg"},
    ],
      "titles": titles,
      "specialties": specialties,
      "time_updated": 1692849090208,
      "refresh_period": 300
      };
    threadService.EditQuickMessage(PayloadEditdata).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });     
  })

  it('delete the quick messages',()=>{
    let PayloadDeletedata ={
      "a":"AGcH-9ZZdlzHAgfzPxtRnl9LOFR-HGpzzI_W0eW9OeuTHtHTV_kbT7WwyNlo96BbiD8QV7sCj2cFsCRdnyMkPnrkh7zlxqzEyRR-d4gFHCVaQ63aMRMOdmmnI4XGYJJ9vwpcFH3Q18Y9lC7fzoY027hRlQXxEkL4Wg|64e68311dbb490d58aacbc9d",
      "macros":[{"id":"64e6a2ce535621f5605bbf21","body":"abcd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}]
    }
    let dummyData :QuickMessagesResponse = {   
      "status": "ok",
      "macros":[
        {  "id": "64e6a2ce535621f5605bbf21",  "body": "abcd" },
    ],
      "titles": titles,
      "specialties": specialties,
      "time_updated": 1692849090208,
      "refresh_period": 300
      };
    threadService.DeleteQuickMessage(PayloadDeletedata).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });    
  })

  it('should rearrange items on drag-and-drop',()=>{
    let dummyData :QuickMessagesResponse = {   
      "status": "ok",
      "macros":[
        { "id": "64e6ce07535621f5605bc0f8","body": "Good Morninggg"},
        {  "id": "64e6a2ce535621f5605bbf21",  "body": "abcd" },
        {"body":"My","id":"64e6ce07535621f5605bc0fl"}
    ],
      "titles": titles,
      "specialties": specialties,
      "time_updated": 1692849090208,
      "refresh_period": 300
      };
    let Dbg = fixture.debugElement;
    let htE = Dbg.nativeElement.querySelector(".dragContainer");
    htE.addEventListener('CdkDragDrop', (ev:any) => {
    threadService.updateQuickMessage(ev).subscribe(data => {
      expect(data).toEqual(dummyData);
    },
    error => {
      expect(error).toEqual(errorMessage);
    });
    let bla = htE.dispatchEvent(new Event('cdkDropListDropped'));
    });    
  })

  it('on key press',()=>{
     const msg = [{"id":"64e6a2ce535621f5605bbf21","body":"abcd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}];
     for (let i = 1; i <= 9 && i < msg.length + 1; i++) {
     const items =  (msg[msg.length - 1 - i + 1]); 
     const item = items.body;
     }
  })
  
  
  it('it should back to message list',()=>{
    const msg = [{"id":"64e6a2ce535621f5605bbf21","body":"abcd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}];
    const back = false; 
    msg.filter(data=>{
      if(!data.id){
        const back = true; 
      }
    })   
 }) 

 it('it switch list to input',()=>{
  const msg = [{"id":"64e6a2ce535621f5605bbf21","body":"abcd"},{"id":"64e6ce07535621f5605bc0f8","body":"Good Morninggg"}];
  const edit = false; 
  msg.filter(data=>{
    if(!data.id){
      const edit = true; 
      const body = data.body
    }
  })   
}) 

});
