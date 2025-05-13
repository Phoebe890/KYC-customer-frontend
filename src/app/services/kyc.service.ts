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
  private readonly API_URL = 'YOUR_BACKEND_API_URL';

  constructor(private http: HttpClient) {}

  submitPersonalInfo(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/kyc/personal-info`, formData);
  }

  submitDocuments(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/kyc/documents`, formData);
  }

  // Method to get form progress/status
  getKycStatus(): Observable<any> {
    return this.http.get(`${this.API_URL}/kyc/status`);
  }

  // Helper method to prepare FormData
  prepareFormData(data: Partial<KycFormData>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    return formData;
  }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Step1Component implements OnInit {
  personalForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private kycService: KycService
  ) {
    this.personalForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', Validators.required],
      selfie: [null, Validators.required]
    });
  }
  ngOnInit(): void {
    // Check if there's any existing KYC status
    this.kycService.getKycStatus().subscribe({
      next: (status) => {
        // If there's existing data, you might want to populate the form
        if (status.personalInfo) {
          this.personalForm.patchValue({
            firstName: status.personalInfo.firstName,
            lastName: status.personalInfo.lastName,
            dateOfBirth: status.personalInfo.dateOfBirth,
            nationality: status.personalInfo.nationality,
            address: status.personalInfo.address
          });
        }
      },
      error: (error) => {
        console.error('Error fetching KYC status:', error);
      }
    });
  }

  onNext() {
    if (this.personalForm.valid) {
      const formData = this.kycService.prepareFormData(this.personalForm.value);
      
      this.kycService.submitPersonalInfo(formData).subscribe({
        next: (response) => {
          console.log('Personal info submitted successfully', response);
          this.router.navigate(['/step2']);
        },
        error: (error) => {
          console.error('Error submitting personal info', error);
          // Handle error (show error message to user)
        }
      });
    }
  }
}
