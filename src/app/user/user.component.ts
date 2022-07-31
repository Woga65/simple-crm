import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Firestore, collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { DocumentData, getFirestore, onSnapshot, getDoc, setDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user: User = new User();
  firestore: Firestore;
  coll: CollectionReference<DocumentData>;
  users$: Observable<DocumentData[]>;
  users: Array<DocumentData> = [];

  constructor(public dialog: MatDialog, firestore: Firestore) {
    this.firestore = firestore;
    this.coll = collection(this.firestore, 'users');
    this.users$ = collectionData(this.coll);

    this.users$.subscribe((userData) => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = userData;
    });
  }

  ngOnInit(): void {
  }


  newUser() {
    this.openDialog(new User);
  }

  async editUser(userId:string) {
    await this.getUser(userId);
    this.openDialog(this.user);
  }

  openDialog(user:User = new User) {
    const dialogRef = this.dialog.open(DialogAddUserComponent, { data:{ user: user } });
  }

  async getUser(userId:string) {
      const docRef = doc(this.coll, userId);
      const usrData = await getDoc(docRef)
        .then(res => res.data() || {})
        .catch((err) => ({error: err})); 
      this.user = new User(usrData);
      console.log('usr: ', this.user.toJSON());
  }



  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
}
