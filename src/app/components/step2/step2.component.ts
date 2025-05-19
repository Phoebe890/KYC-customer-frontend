import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { KycService } from '../../services/kyc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StepProgressComponent } from '../../shared/components/step-progress/step-progress.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    StepProgressComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './step2.component.html',
  styleUrls: [
    '../../shared/styles/kyc-form.scss',
    './step2.component.css'
  ]
})
export class Step2Component implements OnInit {
  idForm!: FormGroup;
  documentForm!: FormGroup;
  previews: { [key: string]: string } = {
    front: '',
    back: ''
  };
  selfiePreview: string | null = null;
  currentStep: number = 2;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private kycService: KycService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.idForm = this.formBuilder.group({
      frontPhoto: ['', Validators.required],
      backPhoto: ['', Validators.required],
     // fullName: ['', Validators.required]
    });
    this.documentForm = this.formBuilder.group({
      selfie: [null, Validators.required]
    });

    // Load saved data if available
    this.loadSavedData();
  }

  onFileSelected(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      if (this.isValidImage(file)) {
        this.isLoading = true;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previews[type] = e.target.result;
          this.idForm.patchValue({
            [type + 'Photo']: file
          });
          this.isLoading = false;
        };
        reader.onerror = () => {
          this.snackBar.open('Error loading image. Please try again.', 'Close', {
            duration: 3000
          });
          this.isLoading = false;
        };
        reader.readAsDataURL(file);
      } else {
        this.snackBar.open('Please upload a valid image file (JPG, PNG)', 'Close', {
          duration: 3000
        });
      }
    }
  }

  removeImage(type: 'front' | 'back') {
    this.previews[type] = '';
    this.idForm.patchValue({
      [type + 'Photo']: null
    });
    // Reset the file input
    const input = document.querySelector(`input[type="file"][accept="image/*"]`) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  private isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    return validTypes.includes(file.type);
  }

  onSelfieSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.isValidImage(file)) {
        this.previewSelfie(file);
        this.documentForm.patchValue({ selfie: file });
      } else {
        this.snackBar.open('Please upload a valid image file (JPG, PNG)', 'Close', {
          duration: 3000
        });
      }
    }
  }

  private previewSelfie(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.selfiePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelfie() {
    this.selfiePreview = null;
    this.documentForm.patchValue({ selfie: null });
  }

  onBack() {
    this.router.navigate(['/step1']);
  }

  onNext() {
    if (this.idForm.valid && this.documentForm.valid) {
      try {
        const step2Data = {
          idData: this.idForm.value,
          documentData: {
            ...this.documentForm.value,
            selfiePreview: this.selfiePreview,
            frontPhotoPreview: this.previews['front'],
            backPhotoPreview: this.previews['back']
          }
        };
        
        localStorage.setItem('step2Data', JSON.stringify(step2Data));

        this.snackBar.open('Documents saved successfully', 'Close', {
          duration: 3000
        });

        this.router.navigate(['/step3']);
      } catch (error) {
        console.error('Error saving data:', error);
        this.snackBar.open('Error saving data. Please try again.', 'Close', {
          duration: 3000
        });
      }
    } else {
      this.snackBar.open('Please fill all required fields and upload documents', 'Close', {
        duration: 3000
      });
    }
  }

  private loadSavedData() {
    const savedData = localStorage.getItem('step2Data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      this.idForm.patchValue(parsedData.idData);
      this.documentForm.patchValue(parsedData.documentData);
      this.selfiePreview = parsedData.documentData.selfiePreview;
      this.previews['front'] = parsedData.documentData.frontPhotoPreview;
      this.previews['back'] = parsedData.documentData.backPhotoPreview;
    }
  }

  navigateToStep(step: number) {
    // Prevent navigation to step 3 if current step is not complete
    if (step === 3 && !this.documentForm.valid) {
      this.snackBar.open('Please complete the current step first', 'Close', {
        duration: 3000
      });
      return;
    }

    // Check for unsaved changes
    if (this.documentForm.dirty || this.idForm.dirty) {
      const confirm = window.confirm('You have unsaved changes. Do you want to leave this page?');
      if (!confirm) {
        return;
      }
    }

    // Navigate to selected step
    this.router.navigate([`/step${step}`]);
  }

  onStepClick(step: number) {
    switch (step) {
      case 1:
        this.router.navigate(['/step1']);
        break;
      case 2:
        // Already on step 2
        break;
      case 3:
        this.router.navigate(['/step3']);
        break;
    }
  }
}
