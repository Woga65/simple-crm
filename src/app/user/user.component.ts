import { Component, OnInit, AfterViewInit, ViewChild, Inject, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
export class UserComponent implements OnInit, AfterViewInit, OnDestroy {

  user: User = new User();
  users$: Observable<object[]>;
  users: Array<User | object> = [];

  displayedColumns: string[] = ['position', 'lastName', 'eMail', 'city'];
  dataSource: any; // = new MatTableDataSource(this.users);

  pageIndex: number = 0;
  firstTableRow: ElementRef<HTMLTableRowElement> | any;
  tableObserver!: MutationObserver;

  @ViewChild(MatPaginator) paginator: any | MatPaginator;
  @ViewChild(MatSort) sort: any | MatSort;


  constructor(public dialog: MatDialog, public userService: UserService) {  //, private _liveAnnouncer: LiveAnnouncer) {
    this.users$ = this.userService.getUserList();
    this.users$.pipe(
      map(usr => this.userBirthDateToString(usr))
    ).subscribe(userData => {                                     //  this.users$.subscribe(userData => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = userData;
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.tableObserver = this.observeUserTable();
  }

  ngOnDestroy() {
    this.tableObserver.disconnect();
  }


  newUser() {
    this.openDialog(new User);
  }

  async editUser(userId: string) {
    await this.getUser(userId);
    this.openDialog(this.user);
  }

  async getUser(userId: string) {
    this.user = new User(await this.userService.getUserDoc(userId));
    console.log('user read: ', this.user.toJSON());
  }

  openDialog(user: User = new User) {
    const dialogRef = this.dialog.open(DialogAddUserComponent, { data: { user: user } });
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

  userBirthDateToString(user: Array<any>): any {
    return user.map(u => {
      u.birthDate = new Date(u.birthDate).toLocaleDateString();
      return u;
    });
  }


  checkKeys(event: any, id: any, i: any = 0) {
    //event.preventDefault();
    event.stopPropagation();
    const el = this.getTableElements(event.target);
    const pg: MatPaginator = this.paginator;
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
          break;
        case 'PageUp':
          pg.hasPreviousPage() ? pg.previousPage() : pg.lastPage();
          break;
        case 'PageDown':
          pg.hasNextPage() ? pg.nextPage() : pg.firstPage();
          break;
        case 'Home':
          pg.firstPage();
          break;
        case 'End':
          pg.lastPage();
          break;
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

  observeUserTable() {
    const table: HTMLTableElement | any = document.querySelector('table');
    const options = { childList: true, subtree: true };
    const callback = (mutationList: any[], observer: any) => {
      const ml = mutationList[0];   //in this special case we don't need mutationList.forEach / .filter / ... 
      const addedRow = ml.addedNodes[0];
      const removedRow = ml.removedNodes[0];
      if (addedRow && addedRow.nodeName == 'TR' && addedRow.id) {
        this.firstTableRow = addedRow.id == 'row-0' ? addedRow : this.firstTableRow;
        this.firstTableRow.focus();
      }
      if (removedRow && removedRow.nodeName == 'TR' && removedRow.id) {
        this.firstTableRow.focus();
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(table, options);
    return observer;
  }

  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
}
