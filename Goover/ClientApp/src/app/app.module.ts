import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'msteams', loadChildren: () => import('./msteams/msteams.module').then(m => m.MSTeamsModule) },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
