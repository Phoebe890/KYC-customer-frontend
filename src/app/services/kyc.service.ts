import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface KycFormData {
  // Step 1 - Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  address: string;
  selfie: File;

  // Step 2 - Document Information
  idFront: File;
  idBack: File;
  documentType: string;
  documentNumber: string;
  expiryDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private apiUrl = '/api/kyc'; // Base URL for KYC API

  constructor(private http: HttpClient) {}

  getKycStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  submitPersonalInfo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/personal-info`, formData);
  }

  submitDocuments(formData: FormData): Observable<any> {
    console.log('Service method called with formData:', formData);
    return this.http.post(`${this.apiUrl}/documents`, formData);
  }

  // Helper method to prepare FormData
  prepareFormData(data: any): FormData {
    const formData = new FormData();
    
    // Add form fields to FormData
    Object.keys(data).forEach(key => {
      if (data[key] instanceof File) {
        formData.append(key, data[key], data[key].name);
      } else {
        formData.append(key, data[key]);
      }
    });
    
    return formData;
  }
}
