import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';
import { UserService } from '../services/user.service';
import { LangService } from '../services/lang.service';
import { PlzService, Plz, PlzRow } from '../services/plz.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAddUserComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  selectionChanged: boolean = false;

  filteredPlzData: Observable<PlzRow[]> = new Observable;
  filteredCityData: Observable<PlzRow[]> = new Observable;
  filteredStreetData: Observable<PlzRow[]> = new Observable;

  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb'];
  loading: boolean = false;

  user: User = new User();
  birthDate: Date | any = new Date;
  userExists: boolean = false;

  plzData$: Observable<Plz[]> = new Observable;
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
    this.data = this.data || {};
    this.user = new User(this.data.user);
    this.userExists = this.user.id ? true : false;
    this.birthDate = this.user.birthDate ? new Date(this.user.birthDate) : '';
    //
    if (!this.dialogRef.disableClose) {
      this.dialogRef.backdropClick()
        .pipe(takeUntil(this.componentIsDestroyed$))
        .subscribe(e => this.onNoClick());
    }
    this.dialogRef.keydownEvents()
      .pipe(takeUntil(this.componentIsDestroyed$))
      .subscribe(e => {
        if (e.key == 'Escape') this.onNoClick();
      });
  }


  ngOnInit(): void {
    this._locale = this.langService.getLocale();
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
    if (!this.fieldInvalid() && this.user.hasData()) {
      this.user.birthDate = new Date(this.birthDate).getTime();
      this.user.birthDate = !isNaN(this.user.birthDate) ? this.user.birthDate : 0;
      this.data.user = new User(this.user);
      this.userExists ? this.updateUser() : this.addUser();
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
    this.langService.setLocale(this._locale);
    this._adapter.setLocale(this._locale);
  }


  localize() {
    return this.langService.getLocalFormat(this._locale);
  }


  getFilteredCityData() {
    this.filteredCityData = this.getPostDataBy('plz', this.user.city || '');
  }


  getFilteredStreetData() {
    this.filteredStreetData = this.getPostDataBy('city', this.user.street || '');
  }
  

  getFilteredPostcodeData() {
    this.filteredPlzData = this.getPostDataBy('address', this.user.zipCode || '');
  }
  

  getPostDataBy(by: string, value: string):Observable<PlzRow[]> {
    return this.plzService.getPostalData(by, this.user.zipCode, this.user.city, this.user.street, this._locale)
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        map(data => this.filterPlzData(data?.rows || [])),
        map(data => this.filterPostalData(data || [], value, by)),
        startWith([]),
      );
  }


  filterPlzData(data:PlzRow[]): PlzRow[] {
    return data.filter((d, i) =>
      data.findIndex((v) =>
        v.street == d.street && v.plz == d.plz && d.city == v.city) == i);
  }
 

  private filterPostalData(data:PlzRow[], value: string, by:string) {
    switch (by) {
      case 'postcode': case 'zipcode': case 'plz':
        return data.filter(d => this.dataMatchesCity(d, value));
      case 'city': case 'town':
        return data.filter(d => this.dataMatchesStreet(d, value));
      case 'street': case 'road': case 'address':
        return data.filter(v => v.plz?.toLowerCase().startsWith(value.toLowerCase()));
    }
    return [];
  }


  private dataMatchesCity(data: PlzRow, value: string) {
    const uCity = (this.user.city.toLowerCase().trim() || '');
    const dCity = data.city?.toLowerCase();
    const vCity = value.toLowerCase().trim();
    return (uCity) 
      ? dCity?.startsWith(vCity) && dCity?.startsWith(uCity) 
      : dCity?.startsWith(vCity);
  }


  private dataMatchesStreet(data: PlzRow, value: string) {
    const uStreet = (this.user.street.toLowerCase().trim() || '');
    const dStreet = data.street?.toLowerCase();
    const vStreet = value.toLowerCase().trim();
    return (uStreet) 
      ? dStreet?.startsWith(vStreet) && dStreet?.startsWith(uStreet) 
      : dStreet?.startsWith(vStreet); 
  }


  /*******************************************
  **  input fields focus management allow   **
  **  use <Enter> Key to step through data  **
  *******************************************/

  keyDownEvent(e:KeyboardEvent, pristine: boolean = true) {
    if (pristine) this.checkKeyboardInput(e, e.key, e.target as HTMLElement);
    this.selectionChanged = false;
  }

  checkKeyboardInput(e: KeyboardEvent, key: string, el: HTMLElement) {
    if (key == 'Enter' && el.id) {
      e.preventDefault();
      const nextField = this.inputFields()[this.inputFields().indexOf(el.id) + 1] || this.inputFields()[0];
      document.getElementById(nextField)?.focus();
    }
  }

  inputFields() {
    return [... document.querySelectorAll('.dialog-container input') as any].filter(el => el.id).map(el => el.id)
      .concat(['save-user-button']);
  }


  /***********************************
  **  final input field validation  **
  **  before data record is saved   **
  ***********************************/

  fieldInvalid(): boolean {
    let firstInvalidField: any = null;
    document.querySelectorAll('.dialog-container .mat-form-field').forEach(field => {
      const input = field.querySelector('input');
      firstInvalidField = this.handleValidityState(input, field, firstInvalidField);
    });
    if (firstInvalidField) firstInvalidField.focus();
    return firstInvalidField ? true : false;
  }

  handleValidityState(input: HTMLInputElement | null, field: Element, firstInvalid: any) {
    const validityState = input ? input.validity.valid : true;
    field.classList.toggle('mat-form-field-invalid', !validityState);
    input?.blur(), input?.focus();
    return firstInvalid ? firstInvalid : (validityState ? firstInvalid : input);
  }

}
