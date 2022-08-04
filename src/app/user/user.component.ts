import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../user.service';
//import { SelectionModel } from '@angular/cdk/collections';
//import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {

  user: User = new User();
  users$: Observable<object[]>;
  users: Array<User|object> = [];

  displayedColumns: string[] = ['position', 'lastName', 'eMail', 'city'];
  dataSource: any; // = new MatTableDataSource(this.users);

  @ViewChild(MatPaginator) paginator: any | MatPaginator;  
  @ViewChild(MatSort) sort: any | MatSort;

  constructor(public dialog: MatDialog, public userService: UserService) {  //, private _liveAnnouncer: LiveAnnouncer) {
    this.users$ = this.userService.getUserList();
    this.users$.subscribe(userData => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = userData;
      this.dataSource = new MatTableDataSource(this.users);
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

  async getUser(userId:string) {
    this.user = new User(await this.userService.getUserDoc(userId));
    console.log('user read: ', this.user.toJSON());
  }

  openDialog(user:User = new User) {
    const dialogRef = this.dialog.open(DialogAddUserComponent, { data:{ user: user } });
    dialogRef.afterClosed().subscribe(res => {
      console.log('res: ', res);
    });
  }


  sortChange(sortState: Sort) {
    console.log(sortState.direction ? `${sortState.active} sorted ${sortState.direction}ending` : `sorting cleared`);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkKeys(event: any, id: any, i:any = 0) {
    event.preventDefault();
    event.stopPropagation();
    const el = this.getTableElements(event.target);
    if (event.key != 'Shift' && el.count) {  
      switch (event.code) {
        case 'Enter': 
          this.editUser(id);
          break;
        case 'ArrowUp':
          el.prev ? el.prev.focus() : el.last.focus();
          break;
        case 'ArrowDown':
          el.next ? el.next.focus() : el.first.focus();
      }
    }
  }

  getTableElements(el: HTMLElement): object | any {
    return {
      count: el.parentElement?.childElementCount || 0,
      prev: el.previousElementSibling,
      next: el.nextElementSibling,
      first: el.parentElement?.firstElementChild,
      last: el.parentElement?.lastElementChild
    }    
  }



  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
}
