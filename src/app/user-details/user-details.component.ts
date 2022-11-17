import { Component, OnChanges, SimpleChanges, Input, Inject } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { LangService } from '../services/lang.service';
import { User } from 'src/models/user.class';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnChanges {

  @Input('userData') userData: User = new User();
  @Input('lang') lang: string  = this._locale;
  user: User = new User();
  birthDate: string = '';
  age: number = 0;
  phone: string = '';
  mobile: string = '';

  constructor(
    public langService: LangService,
    @Inject(MAT_DATE_LOCALE) private _locale: string
    ) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.user = new User(this.userData);
      this.birthDate = this.user.birthDate ? new Date(this.user.birthDate).toLocaleDateString() : '';
      this.age = this.getAge();
    }
  }


  private getAge() {
    const diffMillies = Date.now() - new Date(this.user.birthDate).getTime();
    return this.user.birthDate ? Math.abs(new Date(diffMillies).getUTCFullYear() - 1970) : 0;
  }


  localize() {
    return this.langService.getLocalFormat(this.lang);
  }
}
