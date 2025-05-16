import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './step3.component.html',
  styleUrls: [
    '../../shared/styles/kyc-form.scss',
    './step3.component.css'
  ]
})
export class Step3Component implements OnInit {
  stepNumber: number = 3;
  stepTitle: string = 'Step 3';
  stepDescription: string = 'Email verification';
  isCompleted: boolean = false;
  emailForm!: FormGroup;
  currentStep: number = 3;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.currentStep = 3;
  }

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onBack() {
    this.router.navigate(['/step2']);
  }

  onFinish() {
    if (this.emailForm.valid) {
      this.isCompleted = true;
      console.log('KYC process completed', this.emailForm.value);
      this.router.navigate(['/']);
    }
  }

  onStepClick(step: number) {
    switch (step) {
      case 1:
        this.router.navigate(['/step1']);
        break;
      case 2:
        this.router.navigate(['/step2']);
        break;
      case 3:
        // Already on step 3
        break;
    }
  }
}


