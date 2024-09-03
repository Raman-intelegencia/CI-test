// This service is responsible for making HTTP requests related to institution data
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { environment } from '@amsconnect/shared';
import { CreatePatientResponse, PatientSearchResponse } from '../modals/patients.model';
import { BehaviorSubject } from 'rxjs';

// Create headers and set content type to multipart/form-data
const headers = new HttpHeaders();
headers.append('Content-Type', 'multipart/form-data');

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  public API_URL = environment.baseUrl;

  public dataPatientInstitutionSearch = new BehaviorSubject<string>("");
  dataPatientInstitutionSearch$ = this.dataPatientInstitutionSearch.asObservable();

  public dataPatientLastNameSearch = new BehaviorSubject<string>("");
  dataPatientLastNameSearch$ = this.dataPatientLastNameSearch.asObservable();

  constructor(private http:HttpClient) { 
  }

  // Fetch all patients records of institution
  public getAllPatients(institutionId:string, filterData: string): Observable<PatientSearchResponse>{
    // Create params and append instituion ID and filter option
    let params = new HttpParams().set('iid', institutionId);
    // Check if there is filter data and format it as 'name:data'
    if (filterData) {
      const formattedFilter = ` name:${filterData}`;
      params = params.set('filter', formattedFilter);
    }
    // Make the HTTP request to get all patients's records
    return this.http.get<PatientSearchResponse>(`${this.API_URL}/admin/patients`, {
      params: params, 
      headers: headers, 
      withCredentials:true
    }).pipe(
      // Handle errors
      catchError((error)=> {
        return throwError(error);
      })
    )
  }

  // Fetch a patients details of institution
  public getPatientDetails(institutionId:string, patientId: string): Observable<any>{
    // Make the HTTP request to get a patients's details by institution ID & patient ID
    return this.http.get(`${this.API_URL}/admin/ictn_patient/${institutionId}?pid=${patientId}`, { headers: headers, withCredentials:true}).pipe(
      // Handle errors
      catchError((error)=> {
        return throwError(error);
      })
    )
  }

  // Update patient details
  public updatePatientDetails(institutionId:string, patientObj: FormData): Observable<any>{
    // Make the HTTP PUT request to update the patient details after editing
    return this.http.put(`${this.API_URL}/admin/ictn_patient/${institutionId}`, patientObj, { headers: headers}).pipe(
      // Handle errors
      catchError((error)=> {
        return throwError(error);
      })
    )
  }

  public addPatient(instId:string, patientData: object):Observable<CreatePatientResponse>{
    return this.http.post<CreatePatientResponse>(`${this.API_URL}/admin/ictn_patient/${instId}`, patientData, {
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public editPatient(instId:string,editedPatientData: object):Observable<CreatePatientResponse>{
    return this.http.put<CreatePatientResponse>(`${this.API_URL}/admin/ictn_patient/${instId}`, editedPatientData, {
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public getSelectedPatientDetails(instId:string, patientID: string):Observable<CreatePatientResponse>{
    return this.http.get<CreatePatientResponse>(`${this.API_URL}/admin/ictn_patient/${instId}?pid=${patientID}`,{
      headers: headers,
      withCredentials: true
    }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    )
  }

  public setSearchPatientInstitute(searchPatientInstitute: string): void {
    this.dataPatientInstitutionSearch.next(searchPatientInstitute);
  }

  public setPatientLastName(searchPatientLastName: string): void {
    this.dataPatientLastNameSearch.next(searchPatientLastName);
  }
}
