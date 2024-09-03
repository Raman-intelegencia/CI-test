import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateUtilsService {
  public getPreviousMonthDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  public getDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  public toUnixTime(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  public convertUtcToLocalTime(utcDate: string | undefined): string {
    if (!utcDate) {
      return ""
    }
    const date = new Date(utcDate);
    const localTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localTime.toISOString();
  }

  public formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public convertDateToISOFormat(originalDate: Date): string {
    const year = originalDate.getFullYear();
    const month = originalDate.getMonth() + 1; // Months are zero-indexed
    const day = originalDate.getDate();
    const hours = originalDate.getHours();
    const minutes = originalDate.getMinutes();
    const seconds = originalDate.getSeconds();

    // Format the date as an ISO 8601-like string with the local offset
    const isoLikeString = `${year}-${this.pad(month)}-${this.pad(day)}T${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}${this.getOffsetString(originalDate)}`;

    return isoLikeString.split('T')[0];  
    
  }

  // Helper function to pad single-digit numbers with a leading zero
  public pad(number: number):string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  public getOffsetString(date: Date):string {
    // Helper function to get the local offset string in the format "+HH:mm" or "-HH:mm"
    const offsetMinutes = date.getTimezoneOffset();
    const offsetHours = Math.floor(offsetMinutes / 60);
    const offsetMinutesRemainder = offsetMinutes % 60;
    const sign = offsetHours >= 0 ? '-' : '+';

    return `${sign}${this.pad(Math.abs(offsetHours))}:${this.pad(Math.abs(offsetMinutesRemainder))}`;
  }

  public changeTimezone(date: string): string {
    if (date) {
      const utcDate = new Date(date);
      const utcOffsetMilliseconds = utcDate.getTimezoneOffset() * 60000;

      const desiredTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const desiredTimezoneOffset = new Date().toLocaleString('en-US', {
        timeZone: desiredTimezone,
      });
      let desiredTimezoneDate: any = new Date(desiredTimezoneOffset);
      let sourceTimezoneDate: any = new Date();
      const offsetMilliseconds = desiredTimezoneDate - sourceTimezoneDate;

      const convertedDate = new Date(
        utcDate.getTime() - utcOffsetMilliseconds + offsetMilliseconds
      );
      return convertedDate.toString();
    }
    return "";
  }

  public formatDateToCustomString(dateValue: string): string {
    let date = new Date(dateValue);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    const hours = ('0' + date.getUTCHours()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes()).slice(-2);
    const seconds = ('0' + date.getUTCSeconds()).slice(-2);
    const milliseconds = ('00' + date.getUTCMilliseconds()).slice(-3);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  public DateFormat(dateValue: string): string {
    const date = new Date(dateValue);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  public convertDateToUnixEventLogFromDate(curentDateNow:string):number{
    const formattedDate = new Date(curentDateNow).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    var dateObject = new Date(formattedDate);
    return Math.floor(dateObject.getTime() / 1000);
  }

  public convertDateToUnixEventLogToDate(curentDateNow:string):number{
    const originalDate = new Date(curentDateNow);
    
    const increasedDate = new Date(originalDate);
    increasedDate.setDate(originalDate.getDate() + 1);
    
    const formattedIncreasedDate = increasedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    var dateObject = new Date(formattedIncreasedDate);
    return Math.floor(dateObject.getTime() / 1000);
  }

  // Audit User From Date 
  public auditUserConvertFromDateUnix(currentDateNow: string, timeZone: string): number {
    const dateObject = new Date(currentDateNow);
    const formattedDate = dateObject.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timeZone
    });
    const unixTimestamp = new Date(formattedDate).getTime() / 1000;
    return Math.floor(unixTimestamp);
  }

  // Audit User To Date 
  public auditUserConvertToDateUnix(currentDateNow: string, timeZone: string): number {
    const dateObject = new Date(currentDateNow);
    const increasedDate = new Date(dateObject);
    increasedDate.setDate(dateObject.getDate() + 1);

    const formattedDate = increasedDate.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timeZone
    });
    const unixTimestamp = new Date(formattedDate).getTime() / 1000;
    return Math.floor(unixTimestamp);
  } 

  public convertReportingFromDates(dateFrom:string):string {
    const fromParts = dateFrom.split('-');
    return `${fromParts[1]}/${fromParts[2]}/${fromParts[0]}`;
  };

  public convertReportingToDates(dateTo:string):string {
    const toParts = dateTo.split('-');
    return `${toParts[1]}/${toParts[2]}/${toParts[0]}`;
  }

  public extractTimeZoneOffset(dateString: string): string {
    const date: Date = new Date(dateString);
    const timeZoneOffsetInMinutes: number = date.getTimezoneOffset();
    const offsetHours: number = Math.abs(Math.floor(timeZoneOffsetInMinutes / 60));
    const offsetMinutes: number = Math.abs(timeZoneOffsetInMinutes % 60);
    const offset: string = this.getCurrentUTC(offsetHours) + ':' + this.getCurrentUTC(offsetMinutes);
    return offset;
  }

  public getCurrentUTC(number: number): string {
    if (number < 10) {
        return '0' + number;
    }
    return number.toString();
  } 

  public extractTimeZoneOffsetIncludeDST(dateString: string,comingDate:string): string {
    const date: Date = new Date(dateString);
    const bop: Date = new Date(comingDate);
    const timeZoneOffsetInMinutes: number = date.getTimezoneOffset();
    const isDST: boolean = this.isDaylightSavingTime(bop);
    let offsetHours: number;
    let offsetMinutes: number;

    if (isDST) {
        // If DST is in effect, adjust the offset by one hour
        offsetHours = Math.abs(Math.floor((timeZoneOffsetInMinutes - 60) / 60));
        offsetMinutes = Math.abs(timeZoneOffsetInMinutes - 60) % 60;
    } else {
        // If DST is not in effect, use the standard offset
        offsetHours = Math.abs(Math.floor(timeZoneOffsetInMinutes / 60));
        offsetMinutes = Math.abs(timeZoneOffsetInMinutes % 60);
    }

    const offset: string = this.getCurrentUTC(offsetHours) + ':' + this.getCurrentUTC(offsetMinutes);
    return offset;
  }

  public isDaylightSavingTime(date: Date): boolean {
    const januaryOffset: number = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const julyOffset: number = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(januaryOffset, julyOffset) !== date.getTimezoneOffset();
  }

  public getCurrentUTCDST(value: number): string {
    return value < 10 ? '0' + value : '' + value;
  }

}