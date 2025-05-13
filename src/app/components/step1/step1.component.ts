import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; 
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { CountyService } from '../../services/county.service';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,  
    MatNativeDateModule, 
    MatInputModule,
    MatButtonModule,
    HttpClientModule, 
    MatIconModule,  
    MatSelectModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css']
})
export class Step1Component implements OnInit {
  personalForm!: FormGroup;
  selfiePreview: string | null = null;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  counties: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private countyService: CountyService
  ) {}

  ngOnInit() {
    this.personalForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      phoneNumber: ['null', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      
      employmentStatus: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      county: ['', Validators.required],
      selfie: ['null', Validators.required]
    });

    this.countyService.getCounties().subscribe({
      next: (counties) => {
        this.counties = counties;
      },
      error: (error) => {
        console.error('Error loading counties:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selfiePreview = e.target.result;
        this.personalForm.patchValue({
          selfie: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onNext(): void {
    if (this.personalForm.valid) {
      this.router.navigate(['/step2']);
    } else {
      // Mark all fields as touched to show validation errors
      Object.values(this.personalForm.controls).forEach(control => control.markAsTouched());
    }
  }
}