import { Component, OnInit, Inject } from '@angular/core';
import { Firestore, collection, setDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';


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
  firestore: Firestore;
  coll: any;
  userExists: boolean = false;
  

  constructor(
    public dialogRef: MatDialogRef<DialogAddUserComponent>,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    firestore: Firestore,
    @Inject(MAT_DIALOG_DATA) private data:any) {

    this.data = this.data || {};
    this.firestore = firestore;
    this.coll = collection(this.firestore, 'users');
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
    this.user.birthDate = new Date(this.birthDate).getTime();
    this.userExists ? this.updateUser() : this.addUser();
  }

  async addUser() {
    try {
      this.loading = true;
      const newDocRef = doc(this.coll);
      this.user.id = newDocRef.id;
      await setDoc(newDocRef, this.user.toJSON());
      console.log(`New user written to backend successfully. id: ${newDocRef.id}, path: ${newDocRef.path}`);
      this.dialogRef.close(true);
    }
    catch (error) {
      console.error('Failed to write new user to backend: ', error);
      this.dialogRef.close(false);
    }
    finally {
      this.loading = false;
    }
  }

  async updateUser() {
    try {
      this.loading = true;
      const docRef = doc(this.coll, this.user.id);
      const userData:any = this.user.toJSON();
      await updateDoc(docRef, userData);
      console.log(`User '${userData.firstName} ${userData.lastName}' updated successfully. id: ${docRef.id}, path: ${docRef.path}`);
      this.dialogRef.close(true);
    }
    catch (error) {
      console.error('Failed to update user: ', error);
      this.dialogRef.close(false);
    }
    finally {
      this.loading = false;
    }
    this.dialogRef.close(true);
  }


  async deleteUser() {
    try {
      this.loading = true;
      const docRef = doc(this.coll, this.user.id);
      await deleteDoc(docRef);
      console.log(`User '${this.user.firstName} ${this.user.lastName}' deleted successfully. id: ${docRef.id}, path: ${docRef.path}`);
      this.dialogRef.close(true);
    }
    catch (error) {
      console.error('Failed to delete user: ', error);
      this.dialogRef.close(false);
    }
    finally {
      this.loading = false;
    }
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
    /*this.firestore
      .collection('users')
      .add(this.user)
      .then(result => {
        console.log('User written to backend successfully: ', result);
      })
      .catch(err => {
        console.error('Failed to write user to backend: ', err);
      });*/