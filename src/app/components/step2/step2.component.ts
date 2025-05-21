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
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private kycService: KycService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.idForm = this.formBuilder.group({
      frontPhoto: ['', Validators.required],
      backPhoto: ['', Validators.required]
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
          // Update the form control with the File object
          const controlName = type === 'front' ? 'frontPhoto' : 'backPhoto';
          this.idForm.get(controlName)?.setValue(file);
          console.log(`Set ${controlName}:`, file); // Debug log
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
        // Update the form control with the File object
        this.documentForm.get('selfie')?.setValue(file);
        console.log('Set selfie:', file); // Debug log
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
    if (this.idForm.valid && this.documentForm.valid && !this.isSubmitting) {
      // Check if we have customer ID
      const step1Data = localStorage.getItem('step1Data');
      if (!step1Data) {
        this.snackBar.open('Please complete step 1 first', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      try {
        const parsedData = JSON.parse(step1Data);
        console.log('Parsed step1 data:', parsedData); // Debug log

        // Check if we have a valid customerId
        const customerId = parsedData.customerId;
        if (!customerId) {
          console.error('No customerId found in step1Data:', parsedData);
          // Try to get the ID from the backend response
          this.kycService.submitPersonalInfo(new FormData()).subscribe({
            next: (response) => {
              if (response && response.id) {
                // Update the stored data with the customerId
                const updatedData = {
                  ...parsedData,
                  customerId: response.id
                };
                localStorage.setItem('step1Data', JSON.stringify(updatedData));
                // Continue with document upload
                this.uploadDocuments(response.id);
              } else {
                this.snackBar.open('Unable to retrieve customer information. Please try step 1 again.', 'Close', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            },
            error: (error) => {
              console.error('Error retrieving customer ID:', error);
              this.snackBar.open('Error retrieving customer information. Please try step 1 again.', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
          return;
        }

        this.uploadDocuments(customerId);
      } catch (error) {
        console.error('Error processing form data:', error);
        this.snackBar.open('Error processing form data. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched(this.idForm);
      this.markFormGroupTouched(this.documentForm);
      this.snackBar.open('Please upload all required documents', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private uploadDocuments(customerId: number) {
    this.isSubmitting = true;
    
    // Create FormData for document upload
    const formData = new FormData();
    
    // Get the files from the form controls
    const frontPhoto = this.idForm.get('frontPhoto')?.value;
    const backPhoto = this.idForm.get('backPhoto')?.value;
    const selfie = this.documentForm.get('selfie')?.value;

    console.log('Files from form:', { frontPhoto, backPhoto, selfie }); // Debug log

    // Check if files exist and are valid
    if (!frontPhoto || !backPhoto || !selfie) {
      this.snackBar.open('Please upload all required documents', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.isSubmitting = false;
      return;
    }

    // Append files to FormData with the correct field names
    formData.append('frontPhotoId', frontPhoto);
    formData.append('backPhotoId', backPhoto);
    formData.append('selfieImage', selfie);

    console.log('Submitting documents with customerId:', customerId);

    // Submit documents
    this.kycService.submitDocuments(formData).subscribe({
      next: (response) => {
        console.log('Documents submitted successfully:', response);
        // Store the updated data
        const step1Data = localStorage.getItem('step1Data');
        if (step1Data) {
          const parsedData = JSON.parse(step1Data);
          const updatedData = {
            ...parsedData,
            documentsSubmitted: true
          };
          localStorage.setItem('step1Data', JSON.stringify(updatedData));
        }
        
        this.router.navigate(['/step3']);
        this.snackBar.open('Documents uploaded successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error submitting documents:', error);
        this.snackBar.open('Error uploading documents. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
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
