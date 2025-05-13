import { Routes } from '@angular/router';
import { Step1Component } from './components/step1/step1.component';
import { Step2Component } from './components/step2/step2.component';

export const routes: Routes = [
  { path: '', redirectTo: 'step1', pathMatch: 'full' },
  { path: 'step1', component: Step1Component },
  { path: 'step2', component: Step2Component }
];

