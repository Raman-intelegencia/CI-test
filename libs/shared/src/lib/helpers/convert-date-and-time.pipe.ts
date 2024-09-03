import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "convertDateAndTime",
  standalone:true
})
export class ConvertDateAndTimePipe implements PipeTransform {
  transform(timeSlot: string, action: string, ...args: string[]): string | null | Date {
    if (action === 'convertToISOFormat') {
      return this.convertToISOFormat(timeSlot, args[0]);
    } else if (action === 'convertToUTCFormat') {
      return this.convertToUTCFormat(timeSlot, args[0]);
    }
     else if (action === 'convert12HourTo24Hour') {
      return this.convert12HourTo24Hour(timeSlot);
    }
    return null;
  }

  public convertToISOFormat(date: string, time: string): string {
   let isoDateTime = "Invalid date";
   if(date) {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = this.convert12HourTo24Hour(time).split(':').map(Number);
    isoDateTime = new Date(year, month - 1, day, hours, minutes).toISOString();
   }
    return isoDateTime;
  }

  public convert12HourTo24Hour(time12Hour: string): string {
    if (!time12Hour) {
      return '';
    }
    const [time, meridiem] = time12Hour.split(' ');
    if (meridiem === 'PM') {
      const [hours, minutes] = time.split(':');
      const formattedHours = hours==="12"? 12: (parseInt(hours, 10) + 12).toString().padStart(2, '0');
      return `${formattedHours}:${minutes}`;
    }
    if (meridiem === 'AM') {
      const [hours, minutes] = time.split(':');
      const formattedHours = (parseInt(hours, 10) % 12).toString().padStart(2, '0');
      return `${formattedHours}:${minutes}`;
    }
    // If no 'AM' or 'PM' is specified, assume it's in 24-hour format and return as is
    return time;
  } 

  public convertToUTCFormat(date: string, time: string): Date {

    const dateParts = date.split("-") ;
    const timeParts = time.split(/[:\s]/);
    
    const year = dateParts.length > 0 ? parseInt(dateParts[0], 10) : 0;
    const month = dateParts.length > 1 ? parseInt(dateParts[1], 10) - 1 : 0;
    const day = dateParts.length > 2 ? parseInt(dateParts[2], 10) : 0;
    
    let hours = timeParts.length > 0 ? parseInt(timeParts[0], 10) : 0;
    const minutes = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
    const ampm = timeParts.length > 2 ? timeParts[2] : '';
    
    if (ampm.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm.toUpperCase() === "AM" && hours === 12) {
      hours = 0; // Midnight
    }
    
    let dateTime = new Date(year, month, day, hours, minutes);
    return dateTime;
      }
}