import { Component, OnInit, Inject, SecurityContext } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';
import { UserService } from '../user.service';


@Component({
  selector: 'app-dialog-add-user',
  templateUrl: './dialog-add-user.component.html',
  styleUrls: ['./dialog-add-user.component.scss']
})
export class DialogAddUserComponent implements OnInit {

  currentLang: number = 0;
  languages: string[] = ['en-US', 'de', 'en-gb'];
  loading: boolean = false;

  user: User; // = new User();
  birthDate: Date = new Date;
  userExists: boolean = false;
  

  constructor(
    public userService: UserService,
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    @Inject(MAT_DIALOG_DATA) private data:any) {

    this.data = this.data || {};
    this.user = new User(this.data.user);
    this.userExists = this.user.id ? true : false;
  }

  ngOnInit(): void {
    this.currentLang = this.languages.indexOf(this._locale);
    this.currentLang = this.currentLang < 0 ? 0 : this.currentLang;
    this._locale = this.languages[this.currentLang];
    this._adapter.setLocale(this._locale);
  }

  onNoClick() {
    this.dialogRef.close(true);
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
    this.dialogRef.close(true);
  }

  async updateUser() {
    this.loading = true;
    await this.userService.updateUser(this.user);
    this.loading = false;
    this.dialogRef.close(true);
  }

  async deleteUser() {
    this.loading = true;
    await this.userService.deleteUser(this.user);
    this.loading = false;
    this.dialogRef.close(true);
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
      table: {}, form: { lang: 'English (US)' }, update: {}, firstName: {}, 
      lastName: {}, birthDate: { hint: 'MM/DD/YYYY' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    };
  }

  gbFormat(): any {
    return {
      table: {}, form: { lang: 'English (GB)' }, update: {}, firstName: { placeholder: 'John' }, 
      lastName: { placeholder: 'Smith' }, birthDate: { hint: 'DD/MM/YYYY' }, 
      eMail: { placeholder: 'john@smith.co.uk' }, street: { text: 'House No + Street',
      placeholder: '85 Fleet street' }, zipCode: { text: 'Postcode', placeholder: 'EC4Y 1AE' },
      town: { placeholder: 'London' },
    };
  }

  jpFormat(): any {
    return {
      table: {}, form: { lang: 'English (JP)' }, update: {}, firstName: {},
      lastName: {}, birthDate: { hint: 'YYYY/MM/DD' }, eMail: {},
      street: {}, zipCode: {}, town: {},
    }
  };

  defaultFormat(): any {
    return {
      table: {}, form: { lang: 'English (US)' }, update: {},
      firstName: {}, lastName: {}, birthDate: { hint: '' },
      eMail: {}, street: {}, zipCode: {}, town: {},
    };
  }

}




  // old API
  //
  /*
  this.firestore
    .collection('users')
    .add(this.user)
    .then(result => {
      console.log('User written to backend successfully: ', result);
    })
    .catch(err => {
      console.error('Failed to write user to backend: ', err);
    });
*/

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