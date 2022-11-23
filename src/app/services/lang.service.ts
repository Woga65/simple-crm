import { Injectable, Inject, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';


@Injectable({
  providedIn: 'root'
})
export class LangService implements OnInit{

  public lang: string = this._locale;

  constructor(@Inject(MAT_DATE_LOCALE) private _locale: string) { }


  ngOnInit(): void {
    this.lang = this._locale;
  }


  getLocale() {
    return this.lang;
  }


  setLocale(locale: string = "") {
    this.lang = this._locale = locale ? locale : this.lang;
  }


  getLocalFormat(locale:string = ''): any {
    this.lang = this._locale = locale ? locale : this.lang;
    switch (this.lang) {
      case 'ja-JP':
        return this.jpFormat();
      case 'de':
      case 'de-DE':
      case 'de-at':
      case 'de-ch':
        return this.deFormat();
      case 'en-gb':
      case 'fr':
        return this.gbFormat();
      case 'en':
      case 'en-US':
        return this.usFormat();
    }
    return this.defaultFormat();
  }


  private deFormat(): any {
    this.lang = this._locale = 'de';
    return {
      age: 'J.', byAge: 'nach Alter', byCategory: 'Kategorie', add: 'hinzufügen', stats: 'Statistik', addresses: 'Adressen',
      table: { title: 'Nutzerliste', fullName: 'Name', eMail: 'E-Mail', address: 'Adresse' },
      login: { 
        signInTab: 'Login', signInCard: 'Login', loginButton: 'Login', forgotPassword: 'Passwort vergessen?',
        emailText: 'E-Mail', passwordText: 'Passwort', registerTab: 'Registrieren', registerCard: 'Registrierung',
        registerButton: 'Registrieren', guestButton: 'weiter als Gast', resetPasswordTab: 'Passwort zurücksetzen',
        resetPasswordInput: 'E-Mail Adresse zum Zurücksetzen des Passworts', resetPasswordButton: 'zurücksetzen',
      },
      form: { title: 'Nutzer hinzufügen', cancel: 'abbrechen', save: 'speichern', lang: 'Deutsch (DE)' },
      update: { title: 'Nutzer bearbeiten', delete: 'löschen' },
      firstName: { text: 'Vorname', placeholder: 'Wolfgang' },
      lastName: { text: 'Familienname', placeholder: 'Siebert' },
      birthDate: { text: 'Geburtsdatum', hint: 'DD.MM.YYYY' },
      eMail: { text: 'E-Mail-Adresse', placeholder: 'woga@web.de' },
      street: { text: 'Straße + Haus', placeholder: 'Annastraße 16' },
      zipCode: { text: 'PLZ', placeholder: '34117' },
      town: { text: 'Ort', placeholder: 'Kassel' },
    };
  }


  private usFormat(): any {
    return {
      age: 'yo', byAge: 'Ages', byCategory: 'Categories', add: 'add address', stats: 'Statistics', addresses: 'Addresses',
      login: {}, table: {}, form: { lang: 'English (US)' }, update: {}, firstName: {}, 
      lastName: {}, birthDate: { hint: 'MM/DD/YYYY' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    };
  }


  private gbFormat(): any {
    this.lang = this._locale = 'en-gb';
    return {
      age: 'yo', byAge: 'Ages', byCategory: 'Categories', add: 'add address', stats: 'Statistics', addresses: 'Addresses',
      login: {}, table: {}, form: { lang: 'English (GB)' }, update: {}, firstName: { placeholder: 'John' }, 
      lastName: { placeholder: 'Smith' }, birthDate: { hint: 'DD/MM/YYYY' }, 
      eMail: { placeholder: 'john@smith.co.uk' }, street: { text: 'House No + Street',
      placeholder: '85 Fleet street' }, zipCode: { text: 'Postcode', placeholder: 'EC4Y 1AE' },
      town: { placeholder: 'London' },
    };
  }


  private jpFormat(): any {
    this.lang = this._locale = 'en-US';
    return {
      age: 'yo', byAge: 'Ages', byCategory: 'Categories', add: 'add address', stats: 'Statistics', addresses: 'Addresses',
      login: {}, table: {}, form: { lang: 'English (JP)' }, update: {}, firstName: {},
      lastName: {}, birthDate: { hint: 'YYYY/MM/DD' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    }
  };
  

  private defaultFormat(): any {
    this.lang = this._locale = 'en-US';
    return {
      age: 'yo', byAge: 'Ages', byCategory: 'Categories', add: 'add address', stats: 'Statistics', addresses: 'Addresses',
      login: {}, table: {}, form: { lang: 'English (US)' }, update: {},
      firstName: {}, lastName: {}, birthDate: { hint: '' },
      eMail: {}, street: {}, zipCode: {}, town: {},
    };
  }
}
