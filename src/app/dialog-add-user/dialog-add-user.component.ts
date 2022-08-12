import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { User } from 'src/models/user.class';
import { UserService } from '../user.service';
import { LangService } from '../lang.service';
import { PlzService, Plz, PlzRow } from '../plz.service';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})
export class DialogAddUserComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  formControlPlz = new FormControl('');
  formControlCity = new FormControl('');
  formControlStreet = new FormControl('');

  filteredPlzData: Observable<PlzRow[]> | any;
  filteredCityData: Observable<PlzRow[]> | any;
  filteredStreetData: Observable<PlzRow[]> | any;


  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb'];
  loading: boolean = false;

  user: User = new User();
  birthDate: Date = new Date;
  userExists: boolean = false;

  plzData$: Subscription | Observable<Plz[]> | any; // | Plz[];
  plzData: PlzRow[] = [];

  @ViewChild(MatAutocompleteTrigger) trigger:any;

  constructor(
    public userService: UserService,
    public langService: LangService,
    public plzService: PlzService,
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    @Inject(MAT_DIALOG_DATA) private data: any) {
    //
    this.filteredPlzData = this.getFilteredPostcodeData();
    this.filteredCityData = this.getFilteredCityData();
    this.filteredStreetData = this.getFilteredStreetData();
    //
    this.data = this.data || {};
    this.user = new User(this.data.user);
    this.userExists = this.user.id ? true : false;
    this.userExists ? this.birthDate = new Date(this.user.birthDate) : this.birthDate = new Date('1990-01-01');
    //
    this.dialogRef.backdropClick()
    .pipe(takeUntil(this.componentIsDestroyed$))
    .subscribe(e => console.log('backdrop click: ', e));
 }


  ngOnInit(): void {
    this.currentLang = this.languages.indexOf(this._locale);
    this.currentLang = this.currentLang < 0 ? 0 : this.currentLang;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
  }
  

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();      //this.plzData$.unsubscribe();
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


  getFilteredCityData() {
    return this.formControlCity.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => this.getPostDataBy('plz', value || '')),
    );
  }


  getFilteredStreetData() {
    return this.formControlStreet.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((value) => this.getPostDataBy('city', value || '')),
    );
  }
  

  getFilteredPostcodeData() {
    return this.formControlPlz.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => this.getPostDataBy('address', value || '')),
    );
  }
  

  getPostDataBy(by: string, value: string):Observable<PlzRow[]> {
    return this.plzService.getPostalData(by, this.user.zipCode, this.user.city, this.user.street, this._locale)
      .pipe(
        takeUntil(this.componentIsDestroyed$),
        map(data => this.filterPlzData(data?.rows || [])),
        map(data => this.filterPostalData(data || [], value, by))
      );
  }


  filterPlzData(data:PlzRow[]): PlzRow[] {
    return data.filter((d, i) =>
      data.findIndex((v) =>
        v.street == d.street && v.plz == d.plz && d.city == v.city) == i);
  }
 

  private filterPostalData(data:PlzRow[], value: string, by:string) {
    console.log('by: ', by, 'plz: ', this.user.zipCode, 'city: ', this.user.city);
    switch (by) {
      case 'postcode': case 'zipcode': case 'plz':
        return data.filter(v => v.city?.toLowerCase().startsWith(value.toLowerCase()));
      case 'city': case 'town':
        return data.filter(v => v.street?.toLowerCase().startsWith(value.toLowerCase()));
      case 'street': case 'road': case 'address':
        return data.filter(v => v.plz?.toLowerCase().startsWith(value.toLowerCase()));
    }
    return [];
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