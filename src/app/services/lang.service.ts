import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  constructor() { }

  getLocalFormat(locale:string = ''): any {
    switch (locale) {
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
      age: 'J.', add: 'hinzufügen', stats: 'Statistik', users: 'Adressen',
      table: { title: 'Nutzerliste', fullName: 'Name', eMail: 'E-Mail', address: 'Adresse' },
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

  usFormat(): any {
    return {
      age: 'yo', add: 'add user', stats: 'Statistics', users: 'Addresses',
      table: {}, form: { lang: 'English (US)' }, update: {}, firstName: {}, 
      lastName: {}, birthDate: { hint: 'MM/DD/YYYY' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    };
  }

  gbFormat(): any {
    return {
      age: 'yo.', add: 'add user', stats: 'Statistics', users: 'Addresses',
      table: {}, form: { lang: 'English (GB)' }, update: {}, firstName: { placeholder: 'John' }, 
      lastName: { placeholder: 'Smith' }, birthDate: { hint: 'DD/MM/YYYY' }, 
      eMail: { placeholder: 'john@smith.co.uk' }, street: { text: 'House No + Street',
      placeholder: '85 Fleet street' }, zipCode: { text: 'Postcode', placeholder: 'EC4Y 1AE' },
      town: { placeholder: 'London' },
    };
  }

  jpFormat(): any {
    return {
      age: 'yo.', add: 'add user', stats: 'Statistics', users: 'Addresses',
      table: {}, form: { lang: 'English (JP)' }, update: {}, firstName: {},
      lastName: {}, birthDate: { hint: 'YYYY/MM/DD' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    }
  };

  defaultFormat(): any {
    return {
      age: 'yo.', add: 'add user', stats: 'Statistics', users: 'Addresses',
      table: {}, form: { lang: 'English (US)' }, update: {},
      firstName: {}, lastName: {}, birthDate: { hint: '' },
      eMail: {}, street: {}, zipCode: {}, town: {},
    };
  }
}
