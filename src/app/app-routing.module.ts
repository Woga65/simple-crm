import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';
import { AddressComponent } from './address/address.component';
import { LoginComponent } from './login/login.component';
import { LoggedInGuard } from 'ngx-auth-firebaseui';

const routes: Routes = [
  { path: '', component: AddressComponent, canActivate: [LoggedInGuard] },
  { path: 'login', component: LoginComponent},
  { path: 'statistics', component: StatisticsComponent, canActivate: [LoggedInGuard] },
  { path: 'address', component: AddressComponent, canActivate: [LoggedInGuard] },
  { path: '**', component: StatisticsComponent, canActivate: [LoggedInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
