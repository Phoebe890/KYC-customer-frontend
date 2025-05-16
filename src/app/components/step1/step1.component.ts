import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountyService } from '../../services/county.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './step1.component.html',
  styleUrls: [
    '../../shared/styles/kyc-form.scss',
    './step1.component.css'
  ]
})
export class Step1Component implements OnInit {
  personalInfoForm!: FormGroup;
  counties: string[] = [];
  CountryISO = CountryISO;
  SearchCountryField = SearchCountryField;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.Kenya,
    CountryISO.Uganda,
    CountryISO.Tanzania,
    CountryISO.Ethiopia,
    CountryISO.Rwanda
  ];
  maxDate = new Date(); // Sets max date to today
  startDate = new Date(1990, 0, 1); // Sets default view to 1990

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private countyService: CountyService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCounties();
     //localStorage.removeItem('step1Data');
  }

  initForm() {
    this.personalInfoForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', Validators.required],
      employmentStatus: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, this.ageValidator]],
      county: ['', Validators.required]
    });
  }

  loadSavedData() {
    const savedData = localStorage.getItem('step1Data');
    if (savedData) {
      this.personalInfoForm.patchValue(JSON.parse(savedData));
    }
  }

  ageValidator(control: FormControl) {
    if (!control.value) {
      return null;
    }
    const today = new Date();
    const birthDate = new Date(control.value);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return { underage: true };
    }

    return null;
  }

  loadCounties() {
    this.countyService.getCounties().subscribe({
      next: (counties) => {
        this.counties = counties;
      },
      error: (error) => {
        console.error('Error loading counties:', error);
        this.snackBar.open('Error loading counties', 'Close', { duration: 3000 });
      }
    });
  }

  onNext() {
    if (this.personalInfoForm.valid) {
      // Save form data
      localStorage.setItem('step1Data', JSON.stringify(this.personalInfoForm.value));
      
      // Navigate to next step
      this.router.navigate(['/step2']).then(() => {
        // Show success message
        this.snackBar.open('Personal information saved successfully', 'Close', {
          duration: 3000
        });
      });
    } else {
      // Show error message if form is invalid
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000
      });
    }
  }
}

