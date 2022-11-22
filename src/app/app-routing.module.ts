import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';
import { AddressComponent } from './address/address.component';
import { AddressDetailsComponent } from './address-details/address-details.component';

const routes: Routes = [
  { path: '', component: StatisticsComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'address', component: AddressComponent },
  { path: 'address/:id', component: AddressDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
