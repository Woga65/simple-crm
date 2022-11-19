import { Component, OnChanges, OnInit, SimpleChanges, Input, ChangeDetectionStrategy } from '@angular/core';
import { LangService } from '../services/lang.service';
import { User } from 'src/models/user.class';


@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UserDetailsComponent implements OnChanges, OnInit {

  @Input('userData') userData: User = new User();
  user: User = new User();
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
    if (changes['userData']) {
      this.lang = this.langService.getLocale();
      this.user = new User(this.userData);
      this.birthDate = this.user.birthDate ? new Date(this.user.birthDate) : '';  //.toDateString() : ''; //.toLocaleDateString() : '';
      this.age = this.getAge();
    }
  }


  private getAge() {
    const diffMillies = Date.now() - new Date(this.user.birthDate).getTime();
    return this.user.birthDate ? Math.abs(new Date(diffMillies).getUTCFullYear() - 1970) : 0;
  }


  localize() {
    return this.langService.getLocalFormat();
  }
}
