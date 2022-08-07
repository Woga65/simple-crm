import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';
import { UserService } from '../user.service';
import { LangService } from '../lang.service';
import { PlzService, Plz, PlzRow } from '../plz.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})
export class DialogAddUserComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb'];
  loading: boolean = false;

  user: User; // = new User();
  birthDate: Date = new Date;
  userExists: boolean = false;

  plzData$: Subscription | Observable<Plz[]> | any; // | Plz[];
  plzData: PlzRow[] = [];


  constructor(
    public userService: UserService,
    public langService: LangService,
    public plzService: PlzService,
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.data = this.data || {};
    this.user = new User(this.data.user);
    this.userExists = this.user.id ? true : false;
    this.birthDate = new Date(this.user.birthDate);
  }


  ngOnInit(): void {
    this.currentLang = this.languages.indexOf(this._locale);
    this.currentLang = this.currentLang < 0 ? 0 : this.currentLang;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
    this.plzData$ = this.getPostalDataBy('plz');
  }
  

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
    //this.plzData$.unsubscribe();
  }


  onNoClick() {
    this.closeDialog('cancelled');
  }


  saveUser() {
    if (this.user.hasData()) {
      this.user.birthDate = new Date(this.birthDate).getTime();
      this.userExists ? this.updateUser() : this.addUser();
    } else {
      console.log('Empty user data not written!');
    }
  }


  async addUser() {
    this.loading = true;
    await this.userService.createUser(this.user);
    this.loading = false;
    this.closeDialog('added');
  }


  async updateUser() {
    this.loading = true;
    await this.userService.updateUser(this.user);
    this.loading = false;
    this.closeDialog('updated');
  }


  async deleteUser() {
    this.loading = true;
    await this.userService.deleteUser(this.user);
    this.loading = false;
    this.closeDialog('deleted');
  }


  closeDialog(state: string = '') {
    //this.plzData$.unsubscribe();
    this.dialogRef.close({ state: state, lang: this._locale, user: this.user });
  }


  switchLang() {
    this.currentLang = (this.currentLang + 1) % this.languages.length;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
  }


  localize() {
    return this.langService.getLocalFormat(this._locale);
  }


  getPostalDataBy(by: string) {
    return this.plzService.getPostalData(by, this.user.zipCode, this.user.city, this.user.street)
      .pipe(
        takeUntil(this.componentIsDestroyed$),
        map(data => this.filterPlzData(data.rows || []))
      )
      .subscribe((data: PlzRow[]) => {
        this.plzData = data || [];                //this.plzData = this.filterPlzData(data.rows);
        console.log('plzData: ', this.plzData);
      });
  }

  filterPlzData(data:PlzRow[]): PlzRow[] {
    return data.filter((d, i) =>
      data.findIndex((v) =>
        v.street == d.street && v.plz == d.plz && d.city == v.city) == i);
  }

}



/*
  import { DomSanitizer } from '@angular/platform-browser';
  ...
  constructor (public sanitizer: DomSanitizer) {}

  sanitizeUser() {
    const user:any = this.user;
    for (const prop in user)
      user[prop] = Number.isInteger(user[prop]) ?
        user[prop] : 
        this.sanitizer.sanitize(SecurityContext.HTML, user[prop]);
    this.user = new User(user);
  }
*/

/*
getPlz1() {
  const url = 'https://diepost...bla bla';
  fetch(url)
    .then(res => res.json())
    .catch((err) => ({error: err}))
    .then(res => this.plzData = res);
}

async getPlz2() {
  const url = 'https://diepost...bla bla';
  const [resp, err] = await this.resolve(fetch(url));
  return await resp ? resp.json() : err;
}
 
async resolve(p: any) {
  try {
    return [await p, null];
  }
  catch (e)  {
    return [null, e];
  }
}*/