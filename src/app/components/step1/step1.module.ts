import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SharedModule } from '../../shared/shared.module';
import { Step1Component } from './step1.component';

@NgModule({
  declarations: [Step1Component],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    NgxIntlTelInputModule,
    SharedModule
  ],
  exports: [Step1Component]
})
export class Step1Module { } 