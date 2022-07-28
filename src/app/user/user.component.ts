import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Firestore, collectionData, collection, setDoc, doc, CollectionReference, DocumentData, getFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user: User = new User();
  firestore: Firestore;
  coll: CollectionReference<any>;
  users$: Observable<any>;
  users: Array<any> = [];


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

  openDialog() {
    const dialogRef = this.dialog.open(DialogAddUserComponent);
  }


}
