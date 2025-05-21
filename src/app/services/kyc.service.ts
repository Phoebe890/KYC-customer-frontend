import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface KycFormData {
  // Step 1 - Personal Information
  firstName: string;
  lastName: string;
  phoneNumber: string;
  employmentStatus: string;
  dateOfBirth: Date;
  county: string;

  // Step 2 - Document Information
  idFront: File;
  idBack: File;
  selfie: File;

  // Step 3 - Email Verification
  email: string;
}

interface CustomerResponse {
  id: number;
  customerId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  employmentStatus: string;
  dateOfBirth: string;
  county: string;
}

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private apiUrl = 'http://localhost:8081'; // Base URL for API

  constructor(private http: HttpClient) {}

  getKycStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  submitPersonalInfo(formData: FormData): Observable<CustomerResponse> {
    console.log('Submitting personal info:', formData);
    
    // Format the date to YYYY-MM-DD
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const formattedDate = new Date(dateOfBirth).toISOString().split('T')[0];
    
    // Get and format phone number
    const phoneNumber = formData.get('phoneNumber') as string;
    console.log('Raw phone number from form:', phoneNumber);
    
    // Convert FormData to JSON object
    const jsonData = {
      fullName: formData.get('fullName'),
      phoneNumber: phoneNumber,
      employmentStatus: formData.get('employmentStatus'),
      dateOfBirth: formattedDate,
      county: formData.get('county')
    };

    console.log('Sending JSON data:', jsonData);

    return this.http.post<CustomerResponse>(`${this.apiUrl}/new-customer`, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(response => {
        console.log('Raw response from server:', response);
        // Store the customerId from the response
        if (response) {
          // Check what fields are available in the response
          console.log('Response fields:', Object.keys(response));
          
          const dataToStore = {
            ...jsonData,
            customerId: response.id || response.customerId // Try both possible fields
          };
          
          console.log('Data being stored:', dataToStore);
          localStorage.setItem('step1Data', JSON.stringify(dataToStore));
          
          // Verify the stored data
          const storedData = localStorage.getItem('step1Data');
          console.log('Verified stored data:', storedData);
        } else {
          console.error('Invalid response:', response);
        }
      }),
      catchError(error => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  submitDocuments(formData: FormData): Observable<any> {
    console.log('Submitting documents:', formData);
    // Get customerId from localStorage
    const step1Data = localStorage.getItem('step1Data');
    if (!step1Data) {
      throw new Error('Customer information not found. Please complete step 1 first.');
    }
    
    const parsedData = JSON.parse(step1Data);
    const customerId = parsedData.customerId;
    
    if (!customerId) {
      throw new Error('Customer ID not found. Please complete step 1 first.');
    }
    
    console.log('Using customer ID:', customerId); // Add this for debugging
    
    return this.http.put(`${this.apiUrl}/upload-documents/${customerId}`, formData).pipe(
      tap(response => console.log('Documents Response:', response)),
      catchError(error => {
        console.error('Documents API Error:', error);
        throw error;
      })
    );
  }

  submitEmail(email: string): Observable<any> {
    console.log('Submitting email:', email);
    // Get customerId from localStorage
    const step1Data = localStorage.getItem('step1Data');
    if (!step1Data) {
      throw new Error('Customer information not found. Please complete step 1 first.');
    }
    
    const parsedData = JSON.parse(step1Data);
    const customerId = parsedData.customerId;
    
    if (!customerId) {
      throw new Error('Customer ID not found. Please complete step 1 first.');
    }

    // Create URLSearchParams for email upload
    const params = new URLSearchParams();
    params.append('email', email);

    return this.http.put(`${this.apiUrl}/upload-email/${customerId}?${params.toString()}`, null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).pipe(
      tap(response => console.log('Email Response:', response)),
      catchError(error => {
        console.error('Email API Error:', error);
        throw error;
      })
    );
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
