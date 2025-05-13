import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css']
})
export class Step3Component implements OnInit {
  emailForm!: FormGroup;
  emailSent = false;
  emailVerified = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onBack() {
    this.router.navigate(['/step2']);
  }

  onSendVerification() {
    if (this.emailForm.valid) {
      // Simulate email sending
      this.emailSent = true;
      console.log('Verification email sent to:', this.emailForm.value.email);
    }
  }

  onVerify() {
    // Simulate verification
    this.emailVerified = true;
    console.log('Email verified');
  }

  onComplete() {
    if (this.emailVerified) {
      console.log('KYC process completed');
      // Navigate to completion page or show success message
    }
  }
}
