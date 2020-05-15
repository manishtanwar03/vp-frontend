import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// angular imports
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";


// component imports
import { VideocallComponent } from './videocall.component';






@NgModule({
  declarations: [VideocallComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
  ]
})
export class VideocallModule { }
