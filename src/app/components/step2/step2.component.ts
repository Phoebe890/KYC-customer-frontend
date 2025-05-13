import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step2',
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
    private router: Router
  ) {}

  ngOnInit() {
    this.idForm = this.formBuilder.group({
      frontPhoto: ['', Validators.required],
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
      console.log(this.idForm.value);
      this.router.navigate(['/step3']);
    }
  }
}
