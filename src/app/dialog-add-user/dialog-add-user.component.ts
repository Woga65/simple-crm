import { Component, OnInit, Inject, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';
import { UserService } from '../services/user.service';
import { LangService } from '../services/lang.service';
import { PlzService, Plz, PlzRow } from '../services/plz.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil, switchMap } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
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

  userForm: FormGroup = this.formBuilder.group({});


  constructor(
    public userService: UserService,
    public langService: LangService,
    public plzService: PlzService,
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private formBuilder: FormBuilder,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    @Inject(MAT_DIALOG_DATA) private data: any) {}


  ngOnInit(): void {
    this.getUser();
    this.modelToForm();
    this.initPostcodeApi();
    this.getLocale();
    this.initDialogCloseActions();
  }
  

  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();      //this.plzData$.unsubscribe();
  }


  onNoClick() {
    this.closeDialog('cancelled');
  }


  getUser() {
    this.data = this.data || {};
    this.user = new User(this.data.user);
    this.userExists = this.user.id ? true : false;
    this.birthDate = this.user.birthDate ? new Date(this.user.birthDate) : '';
  }


  saveUser() {
    if (!this.userForm.errors && this.user.hasData()) {
      this.formToModel();
      this.userExists ? this.updateUser() : this.addUser();
    } else {
      this.getFormControls(this.userForm).filter(fc => fc.state.errors).forEach(fc => fc.state.markAsTouched());
      console.log('Empty Data not written!');
    }
  }


  async addUser() {
    this.isLoading(true);
    await this.userService.createUser(this.user);
    this.isLoading(false);
    this.closeDialog('added');
  }


  async updateUser() {
    this.isLoading(true);
    await this.userService.updateUser(this.user);
    this.isLoading(false);
    this.closeDialog('updated');
  }


  async deleteUser() {
    this.isLoading(true);
    await this.userService.deleteUser(this.user);
    this.isLoading(false);
    this.closeDialog('deleted');
  }


  closeDialog(state: string = '') {
    this.dialogRef.close({ state: state, lang: this._locale, user: this.user });
  }


  modelToForm() {
    this.userForm = this.formBuilder.group({
      firstName: [this.user.firstName, Validators.nullValidator],
      lastName: [this.user.lastName, Validators.required],
      birthDate: [this.birthDate],
      eMail: [this.user.eMail, Validators.email],
      zipCode: [this.user.zipCode],
      city: [this.user.city],
      street: [this.user.street]
    });
  }


  formToModel() {
    this.getFormControls(this.userForm).forEach(fc => this.user[(fc.control  as keyof(User))] = fc.state.value);
    this.user.birthDate = this.dateToTimestamp(this.birthDate);
    this.data.user = new User(this.user);
  }


  getFormControls(form: FormGroup) {
    return Object.keys(form.controls).map( f => ({ control: f, state: form.controls[f] }));
  }


  dateToTimestamp(date: any) {
    return !isNaN(new Date(date).getTime()) ? new Date(date).getTime() : 0;
  }


  isLoading(loading: boolean) {
    this.loading = loading;
    loading ? this.userForm.disable() : this.userForm.enable();
  }



  /*******************************
  **  functions related to the  **
  **  the Deutsche Post API     **
  ********************************/

  initPostcodeApi() {
    this.filteredPlzData = this.getFilteredPostalData('zipCode', 'address');
    this.filteredCityData = this.getFilteredPostalData('city', 'plz');
    this.filteredStreetData = this.getFilteredPostalData('street', 'city');
  }


  getFilteredPostalData(field: string, findBy: string) {
    return this.userForm.controls[field].valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => this.getPostDataBy(findBy, value || '')),
    );
  }
  

  getPostDataBy(by: string, value: string):Observable<PlzRow[]> {
    const sf = this.searchField(value);
    const key = by as keyof(object);
    return this.plzService.getPostalData(by, sf[key]['zipCode'], sf[key]['city'], sf[key]['street'], this._locale)
      .pipe(
        map(data => this.filterPlzData(data?.rows || [])),
        map(data => this.filterPostalData(data || [], value, by)),
      );
  }

  searchField(value: string) {
    return {
      address: { zipCode: value, city: this.userForm.controls['city'].value, street: this.userForm.controls['street'].value, },
      plz: { zipCode: this.userForm.controls['zipCode'].value, city: value, street: this.userForm.controls['street'].value, },
      city: { zipCode: this.userForm.controls['zipCode'].value, city: this.userForm.controls['city'].value, street: value }
    }
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
    const uCity = (this.userForm.controls['city'].value.toLowerCase().trim() || '');
    const dCity = data.city?.toLowerCase();
    const vCity = value.toLowerCase().trim();
    return (uCity) 
      ? dCity?.startsWith(vCity) && dCity?.startsWith(uCity) 
      : dCity?.startsWith(vCity);
  }


  private dataMatchesStreet(data: PlzRow, value: string) {
    const uStreet = (this.userForm.controls['street'].value.toLowerCase().trim() || '');
    const dStreet = data.street?.toLowerCase();
    const vStreet = value.toLowerCase().trim();
    return (uStreet) 
      ? dStreet?.startsWith(vStreet) && dStreet?.startsWith(uStreet) 
      : dStreet?.startsWith(vStreet); 
  }



  /*************************************
  **  localization related functions  **
  *************************************/

  getLocale() {
    this._locale = this.langService.getLocale();
    this.currentLang = this.languages.indexOf(this._locale);
    this.currentLang = this.currentLang < 0 ? 0 : this.currentLang;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
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



  /*******************************************
  **  input fields focus management allows  **
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



  /*********************************
  **  setup allowed user actions  **
  **  that will close the dialog  **
  *********************************/

  initDialogCloseActions() {
    this.closeOnBackdropClick();
    this.closeOnEscapeKey();
  }


  closeOnBackdropClick() {
    if (!this.dialogRef.disableClose) {
      this.dialogRef.backdropClick()
        .pipe(takeUntil(this.componentIsDestroyed$))
        .subscribe(e => this.onNoClick());
    }
  }


  closeOnEscapeKey() {
    this.dialogRef.keydownEvents()
      .pipe(takeUntil(this.componentIsDestroyed$))
      .subscribe(e => {
        if (e.key == 'Escape') this.onNoClick();
      });
  }

}
