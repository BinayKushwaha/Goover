import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MSTeamsRoutingModule } from './msteamsrouting.module';
import { HomeComponent } from './personal-tabs/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MSTeamsRoutingModule,
    NgbModule,
  ]
})
export class MSTeamsModule { }
