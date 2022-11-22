import { Component, OnChanges, OnInit, SimpleChanges, Input, ChangeDetectionStrategy } from '@angular/core';
import { LangService } from '../services/lang.service';
import { Addr } from 'src/models/addr.class';


@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AddressDetailsComponent implements OnChanges, OnInit {

  @Input('addrData') addrData: Addr = new Addr();
  address: Addr = new Addr();
  birthDate: any = '';
  age: number = 0;
  phone: string = '';
  mobile: string = '';
  lang: string = navigator.language;

  constructor(public langService: LangService) {}


  ngOnInit(): void {
    this.lang = this.langService.getLocale();
  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['addrData']) {
      this.lang = this.langService.getLocale();
      this.address = new Addr(this.addrData);
      this.birthDate = this.address.birthDate ? new Date(this.address.birthDate) : '';  //.toDateString() : ''; //.toLocaleDateString() : '';
      this.age = this.getAge();
    }
  }


  private getAge() {
    const diffMillies = Date.now() - new Date(this.address.birthDate).getTime();
    return this.address.birthDate ? Math.abs(new Date(diffMillies).getUTCFullYear() - 1970) : 0;
  }


  localize() {
    return this.langService.getLocalFormat();
  }
}
