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
    StepProgressComponent
  ]
})
export class Step3Component implements OnInit {
  emailForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
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
    if (this.emailForm.valid) {
      localStorage.setItem('step3Data', JSON.stringify(this.emailForm.value));
      this.router.navigate(['/success']).then(() => {
        this.snackBar.open('Email verification completed successfully', 'Close', {
          duration: 3000
        });
      });
    } else {
      this.snackBar.open('Please enter a valid email address', 'Close', {
        duration: 3000
      });
    }
  }
}


