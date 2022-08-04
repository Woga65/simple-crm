import { Component, OnInit, Inject, SecurityContext } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/models/user.class';
import { UserService } from '../user.service';
import { LangService } from '../lang.service';


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
    public langService: LangService,
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