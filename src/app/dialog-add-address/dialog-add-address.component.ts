import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Addr } from 'src/models/addr.class';
import { AddrService } from '../services/addr.service';
import { LangService } from '../services/lang.service';
import { PlzService, Plz, PlzRow } from '../services/plz.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-dialog-add-Address',
  templateUrl: './dialog-add-address.component.html',
  styleUrls: ['./dialog-add-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})

export class DialogAddAddressComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  selectionChanged: boolean = false;

  filteredPlzData: Observable<PlzRow[]> = new Observable;
  filteredCityData: Observable<PlzRow[]> = new Observable;
  filteredStreetData: Observable<PlzRow[]> = new Observable;

  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb'];
  loading: boolean = false;

  address: Addr = new Addr();
  birthDate: Date | any = new Date;
  addrExists: boolean = false;

  plzData$: Observable<Plz[]> = new Observable;
  plzData: PlzRow[] = [];

  addrForm: FormGroup = this.formBuilder.group({});


  constructor(
    public addrService: AddrService,
    public langService: LangService,
    public plzService: PlzService,
    public dialogRef: MatDialogRef<DialogAddAddressComponent>,
    private formBuilder: FormBuilder,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    @Inject(MAT_DIALOG_DATA) private data: any) {}


  ngOnInit(): void {
    this.getAddr();
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


  getAddr() {
    this.data = this.data || {};
    this.address = new Addr(this.data.address);
    this.addrExists = this.address.id ? true : false;
    this.birthDate = this.address.birthDate ? new Date(this.address.birthDate) : '';
  }


  saveAddr() {
    this.formToModel();
    if (!this.addrForm.errors && this.address.hasData()) {
      this.addrExists ? this.updateAddr() : this.addAddr();
    } else {
      this.getFormControls(this.addrForm).filter(fc => fc.state.errors).forEach(fc => fc.state.markAsTouched());
      console.log('Empty Data not written!');
    }
  }


  async addAddr() {
    this.isLoading(true);
    await this.addrService.createAddr(this.address);
    this.isLoading(false);
    this.closeDialog('added');
  }


  async updateAddr() {
    this.isLoading(true);
    await this.addrService.updateAddr(this.address);
    this.isLoading(false);
    this.closeDialog('updated');
  }


  async deleteAddr() {
    this.isLoading(true);
    await this.addrService.deleteAddr(this.address);
    this.isLoading(false);
    this.closeDialog('deleted');
  }


  closeDialog(state: string = '') {
    this.dialogRef.close({ state: state, lang: this._locale, address: this.address });
  }


  modelToForm() {
    this.addrForm = this.formBuilder.group({
      firstName: [this.address.firstName, Validators.nullValidator],
      lastName: [this.address.lastName, Validators.required],
      birthDate: [this.birthDate],
      eMail: [this.address.eMail, Validators.email],
      zipCode: [this.address.zipCode],
      city: [this.address.city],
      street: [this.address.street]
    });
  }


  formToModel() {
    this.getFormControls(this.addrForm).forEach(fc => this.address[(fc.control  as keyof(Addr))] = fc.state.value);
    this.address.birthDate = this.dateToTimestamp(this.addrForm.controls['birthDate'].value);
    this.data.address = new Addr(this.address);
  }


  getFormControls(form: FormGroup) {
    return Object.keys(form.controls).map( f => ({ control: f, state: form.controls[f] }));
  }


  dateToTimestamp(date: any) {
    return !isNaN(new Date(date).getTime()) ? new Date(date).getTime() : 0;
  }


  isLoading(loading: boolean) {
    this.loading = loading;
    loading ? this.addrForm.disable() : this.addrForm.enable();
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
    return this.addrForm.controls[field].valueChanges.pipe(
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
      address: { zipCode: value, city: this.addrForm.controls['city'].value, street: this.addrForm.controls['street'].value, },
      plz: { zipCode: this.addrForm.controls['zipCode'].value, city: value, street: this.addrForm.controls['street'].value, },
      city: { zipCode: this.addrForm.controls['zipCode'].value, city: this.addrForm.controls['city'].value, street: value }
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
    const aCity = (this.addrForm.controls['city'].value.toLowerCase().trim() || '');
    const dCity = data.city?.toLowerCase();
    const vCity = value.toLowerCase().trim();
    return (aCity) 
      ? dCity?.startsWith(vCity) && dCity?.startsWith(aCity) 
      : dCity?.startsWith(vCity);
  }


  private dataMatchesStreet(data: PlzRow, value: string) {
    const aStreet = (this.addrForm.controls['street'].value.toLowerCase().trim() || '');
    const dStreet = data.street?.toLowerCase();
    const vStreet = value.toLowerCase().trim();
    return (aStreet) 
      ? dStreet?.startsWith(vStreet) && dStreet?.startsWith(aStreet) 
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
      .concat(['save-addr-button']);
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
