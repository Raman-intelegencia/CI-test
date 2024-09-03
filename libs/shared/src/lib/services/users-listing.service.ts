import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
  })

  export class UsersListingService {

    public getImageUrl(imageUrl: string, image_id: string): string {
        return imageUrl + image_id + "_profile.png";
      }
  }