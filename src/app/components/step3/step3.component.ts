import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StepProgressComponent } from '../../shared/components/step-progress/step-progress.component';
import { KycService } from '../../services/kyc.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    StepProgressComponent,
    MatProgressSpinnerModule
  ]
})
export class Step3Component implements OnInit {
  emailForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private kycService: KycService
  ) {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Load saved data if any
    const savedData = localStorage.getItem('step3Data');
    if (savedData) {
      this.emailForm.patchValue(JSON.parse(savedData));
    }
  }

  onBack() {
    this.router.navigate(['/step2']);
  }

  onSubmit() {
    if (this.emailForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const email = this.emailForm.get('email')?.value;

      this.kycService.submitEmail(email).subscribe({
        next: (response) => {
          // Save form data to localStorage
          localStorage.setItem('step3Data', JSON.stringify(this.emailForm.value));
          
          this.router.navigate(['/success']).then(() => {
            this.snackBar.open('Email verification completed successfully', 'Close', {
              duration: 3000
            });
          });
        },
        error: (error) => {
          console.error('Error submitting email:', error);
          this.snackBar.open('Error verifying email. Please try again.', 'Close', {
            duration: 5000
          });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.snackBar.open('Please enter a valid email address', 'Close', {
        duration: 3000
      });
    }
  }
}


