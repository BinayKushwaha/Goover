import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MSTeamsRoutingModule } from './msteamsrouting.module';
import { HomeComponent } from './personal-tabs/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    MSTeamsRoutingModule,
    NgbModule,
  ]
})
export class MSTeamsModule { }
