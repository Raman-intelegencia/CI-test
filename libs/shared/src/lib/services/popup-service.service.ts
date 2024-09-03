import { Injectable, computed, signal } from '@angular/core';
import { Reference, composeArray, externalComposeArray } from '@amsconnect/shared';

@Injectable({
  providedIn: "root",
})
export class PopupServiceService {
  public composePopups = signal<composeArray[]>([]);
  public externalComposePopups = signal<externalComposeArray[]>([]);

  public addComposePopUp(data: composeArray): void {
    this.composePopups.mutate((val) => {
      data.id = val.length + 1;
      data.minimized = val.length !== 0;
      val.unshift(data);
      this.initializeComposePopUps();
    });
  }

  public addExternalComposePopUp(data:externalComposeArray): void{
    this.externalComposePopups.mutate((val) => {
      data.id = val.length + 1; 
      data.minimized = val.length !== 0;
      val.unshift(data);
      this.initializeExternalComposePopUps();
    });
  }

  public removeComposePopUp(index: number): void {
    this.composePopups.mutate((val) => {
      if (index >= 0 && index < val.length) {
        val.shift();
        // Update id for the remaining items
        val = val.map((item, i) => {
          return { ...item, id: i + 1 };
        });
      }
      this.initializeComposePopUps();
    });
  }
  public removeExternalComposePopUp(index: number): void {
    this.externalComposePopups.mutate((val) => {
      if (index >= 0 && index < val.length) {
        val.shift();
        // Update id for the remaining items
        val = val.map((item, i) => {
          return { ...item, id: i + 1 };
        });
      }
      this.initializeExternalComposePopUps();
    });
  }

  public updateComposePopUp(key: keyof composeArray, value: string | Reference[]): void {
    this.composePopups.mutate((val) => {
        if (key === "to") {
            // Ensure value is an array when updating 'to'
            if (Array.isArray(value)) {
                val[0].to = value;
            }
        } else {
            // Handle 'patient', 'subject', and 'message' as strings
            val[0][key as "patient" | "subject" | "message"] = value as string;
        }
    });
}


  public updateExternalComposePopUp(key: keyof externalComposeArray, value: string): void {
    const stringKeys: (keyof externalComposeArray)[] = [
      "department",
      "to",
      "recipient_name"
    ];
    if (stringKeys.includes(key)) {
      this.externalComposePopups.mutate((val) => {
        val[0][key as "department" | "to" | "recipient_name"] = value;
      });
    }
  }

  public swapComposePopUps(swapIndex: number): void {
    this.composePopups.mutate((val) => {
      if (swapIndex >= 0 && swapIndex < val.length) {
        [val[0], val[swapIndex]] = [val[swapIndex], val[0]];
      }
      this.initializeComposePopUps();
    });
  }
  public swapComposeExternalPopUps(swapIndex: number): void {
    this.externalComposePopups.mutate((val) => {
      if (swapIndex >= 0 && swapIndex < val.length) {
        [val[0], val[swapIndex]] = [val[swapIndex], val[0]];
      }
      this.initializeExternalComposePopUps();
    });
  }

  private initializeComposePopUps(): void {
    this.composePopups.mutate((val) => {
      val.map((item, index) => {
        item.minimized = index !== 0;
      });
    });
  }  

  private initializeExternalComposePopUps():void{
    this.externalComposePopups.mutate((val)=>{
      val.map((item,index) =>{
        item.minimized = index !==0;
      })
    })
  }
  // Add the users to compose object 'To' 
  public addUserToCompose(index: number, user: Reference): void {
    this.composePopups.mutate((val) => {
      if (index >= 0 && index < val.length) {
        const popup = val[index];
        if (!popup.to.some(u => u.id === user.id)) { // Check for duplicate
          popup.to = [...popup.to, user];
        }
      }
    });
  }
  // remove the users to compose object 'To'
  public removeUserFromCompose(index: number, users: Reference): void {
    this.composePopups.mutate((val) => {
      if (index >= 0 && index < val.length) {
        const popup = val[index];
        // Remove the Reference objects from the 'to' array
        popup.to = popup.to.filter(toUser => toUser.id !== users.id);
      }
    });
  }
  
  

}