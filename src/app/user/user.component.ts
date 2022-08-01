import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Firestore, collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { DocumentData, getFirestore, onSnapshot, getDoc, setDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
//import { SelectionModel } from '@angular/cdk/collections';
//import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {

  user: User = new User();
  firestore: Firestore;
  coll: CollectionReference<DocumentData>;
  users$: Observable<DocumentData[]>;
  users: Array<DocumentData | User> = [];

  displayedColumns: string[] = ['position', 'lastName', 'eMail', 'city'];
  dataSource: any; // = new MatTableDataSource<DocumentData | User>(this.users);

  @ViewChild(MatPaginator) paginator: any | MatPaginator;  
  @ViewChild(MatSort) sort: any | MatSort;

  constructor(public dialog: MatDialog, firestore: Firestore) {  //, private _liveAnnouncer: LiveAnnouncer) {

    this.firestore = firestore;
    this.coll = collection(this.firestore, 'users');
    this.users$ = collectionData(this.coll);

    this.users$.subscribe((userData: Array<DocumentData | User>) => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = userData;
      this.dataSource = new MatTableDataSource<DocumentData | User>(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }

  ngOnInit(): void {}

  ngAfterViewInit() {}


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
      console.log('user read: ', this.user.toJSON());
  }

  sortChange(sortState: Sort) {
    console.log(sortState.direction ? `${sortState.active} sorted ${sortState.direction}ending` : `sorting cleared`);
  }


  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
}

/*
export interface UserTable {
  firstName: string;
  lastName: number;
  birthDate: number;
  eMail: string;
  street: number;
  zipCode: string;
  city: string;
  id: string;
}*/