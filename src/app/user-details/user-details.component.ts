import { Component, OnInit, Inject, Optional } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { Firestore, collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { DocumentData, getFirestore, doc, onSnapshot, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {

  firestore: Firestore;
  coll: CollectionReference<DocumentData>    //any;

  param$: Observable<ParamMap>;
  users$: Observable<DocumentData[]>;
  users: Array<DocumentData> = [];
  userId: string = '';
  user: User = new User;

  constructor(
    private route: ActivatedRoute, firestore:Firestore, public dialog: MatDialog) {

    this.firestore = firestore;
    this.coll = collection(this.firestore, 'users');
    this.users$ = collectionData(this.coll);

    this.param$ = route.paramMap;
    this.param$.subscribe(par => {
      this.userId = par.get('id') || '';
      this.getUser();
    });
  }

  ngOnInit(): void {
  }

  getUser() {
    const docRef = doc(this.coll, this.userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
    });
  }

  editAddressDialog() {
    const dialog:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
  }

  logParam = async () => await this.param$.forEach(p => console.log('id: ', p.get('id')));
  getParamSnapshot = () => this.route.snapshot.paramMap.get('id') || '';
}




  /*
  async getUser() {
    const docRef = doc(this.coll, this.userId);
    const usrData = await getDoc(docRef)
      .then(res => res.data() || {})
      .catch((err) => ({error: err}));

    this.user = new User(usrData);
    console.log('usr: ', this.user.toJSON());
    */

    /*
    try {
      const usrData = (await getDoc(docRef)).data() || {};
      this.user = new User(usrData);
    }
    catch (error) {
      console.error('Failed reading user from backend: ', error);
      this.user = new User();
    };
    console.log('usr: ', this.user.toJSON());    
  }*/
