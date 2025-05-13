import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KycService } from '../../services/kyc.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
//import { NgxImageCropperModule } from 'ngx-image-cropper';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
   // NgxImageCropperModule
  ],
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css']
})
export class Step2Component implements OnInit {
  idForm!: FormGroup;
  previews: { [key: string]: string } = {
    front: '',
    back: ''
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private kycService: KycService
  ) {}

  ngOnInit() {
    this.idForm = this.formBuilder.group({
      frontPhoto: ['', Validators.required],
      fullName: ['', Validators.required],
      backPhoto: ['', Validators.required]
    });
  }

  onFileSelected(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previews[type] = e.target.result;
        this.idForm.patchValue({
          [type + 'Photo']: file
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onBack() {
    this.router.navigate(['/step1']);
  }

  onNext() {
    if (this.idForm.valid) {
      const formData = this.kycService.prepareFormData(this.idForm.value);
      
      this.kycService.submitDocuments(formData).subscribe({
        next: (response) => {
          console.log('Documents submitted successfully', response);
          this.router.navigate(['/step3']);
        },
        error: (error) => {
          console.error('Error submitting documents', error);
          // Handle error (show error message to user)
        }
      });
    }
  }
}
