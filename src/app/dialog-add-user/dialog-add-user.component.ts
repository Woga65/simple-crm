import { Component, OnInit, Inject } from '@angular/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import 'moment/locale/de';
import 'moment/locale/fr';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})
export class DialogAddUserComponent implements OnInit {

  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb', 'ja-JP'];

  constructor(   private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,) { }

  ngOnInit(): void {
    this.currentLang = this.languages.indexOf(this._locale);
    this.currentLang = this.currentLang < 0 ? 0 : this.currentLang;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
  }

  onNoClick() {
  }

  switchLang() {
    this.currentLang = (this.currentLang + 1) % this.languages.length;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
  }

  getLocalFormat(): any {
    switch (this._locale) {
      case 'ja-JP':
        return this.jpFormat();
      case 'de':
      case 'de-at':
      case 'de-ch':
        return this.deFormat();
      case 'en-gb':
      case 'fr':
        return this.gbFormat();
      case 'en-US':
         return this.usFormat();
    }
    return this.defaultFormat();
  }

  deFormat(): any {
    return { 
      form: { title: 'Nutzer hinzufügen', cancel: 'abbrechen', save: 'speichern', lang: 'Deutsch (DE)' },
      firstName: { text: 'Vorname', placeholder: 'Wolfgang' },
      lastName: { text: 'Familienname', placeholder: 'Siebert' },
      birthDate: { text: 'Geburtsdatum', hint:'DD.MM.YYYY' },
      street: { text: 'Straße + Haus', placeholder: 'Annastraße 16' },
      zipCode: { text: 'PLZ', placeholder: '34117' },
      town: { text: 'Ort', placeholder: 'Kassel' }, 
    };
  }

  usFormat(): any {
    return {
      form: { lang: 'English (US)' }, firstName: {}, lastName: {}, 
      birthDate: { hint: 'MM/DD/YYYY' },
      street: {}, zipCode: {}, town: {}, 
    };
  }

  gbFormat(): any {
    return { 
      form: { lang: 'English (GB)' }, firstName: { placeholder: 'John' }, lastName: { placeholder: 'Smith' }, 
      birthDate: { hint: 'DD/MM/YYYY' },
      street: { text: 'House No + Street', placeholder: '85 Fleet street' }, 
      zipCode: { text: 'Postcode', placeholder: 'EC4Y 1AE' }, town: { placeholder: 'London'}, 
    };
  }

  jpFormat(): any {
    return {       
      form: { lang: 'English (JP)' }, firstName: {}, lastName: {}, 
      birthDate: { hint: 'YYYY/MM/DD' },
      street: {}, zipCode: {}, town: {},
    } 
  };

  defaultFormat(): any {
    return {      
      form: { lang: 'English (US)'}, firstName: {}, lastName: {}, 
      birthDate: { hint: '' },
      street: {}, zipCode: {}, town: {},
    };
  }

}
