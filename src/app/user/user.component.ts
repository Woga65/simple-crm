import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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
  private componentIsDestroyed$ = new Subject<boolean>();

  user: User = new User();
  users$: Observable<User[]>;
  users: User[] = [];

  displayedColumns: string[] = ['position', 'lastName', 'eMail', 'city', 'marker'];
  dataSource: any;    // MatTableDataSource

  pageIndex: number = 0;
  firstTableRow: ElementRef<HTMLTableRowElement> | any;
  tableObserver!: MutationObserver;
  changedRowId: string = '';
  filterValue: string = '';

  @ViewChild(MatPaginator) paginator: any | MatPaginator;
  @ViewChild(MatSort) sort = new MatSort();


  constructor(public dialog: MatDialog, public userService: UserService) {  //, private _liveAnnouncer: LiveAnnouncer) {
    this.users$ = this.userService.getUserList() as Observable<User[]>;
  }


  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.tableObserver = this.observeUserTable();
    this.initUsersList();
  }


  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
    this.tableObserver.disconnect();
  }


  newUser() {
    this.openDialog(new User);
  }


  async editUser(userId: string) {
    console.log('user:', userId);
    await this.getUser(userId);
    this.openDialog(this.user);
  }


  async markUser(userId: string, marker: string) {
    const m = (marker && marker == ' ') ? '' : '=' + marker.toUpperCase();
    await this.getUser(userId);
    this.user.marker = m;
    await this.userService.updateUser(this.user);
    console.log('user marked: ', userId, '/', marker);
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


  initUsersList() {
    this.users$.pipe(
      takeUntil(this.componentIsDestroyed$),
      map(usr => this.userBirthDateToString(usr))
    ).subscribe(userData => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = userData;
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = ((row:User, name:string) => {
        return (name == 'marker' && !row.marker)
          ? ( this.dataSource.sort.direction == 'asc' ? 'z' : ' ' ) 
          : row[name as keyof User];
      });
    });
  }


  sortChange(sortState: Sort) {
    console.log(sortState.direction ? `${sortState.active} sorted ${sortState.direction}ending` : `sorting cleared`);
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  userBirthDateToString(user: User[]): User[] {
    return user.map(u => {
      u.birthDate = new Date(u.birthDate).toLocaleDateString();
      return u;
    });
  }


  checkKeys(e: KeyboardEvent, id: any, row: any = 0) {
    this.changedRowId = '';
    const el = this.getTableElements(e.target as HTMLElement);
    const pg: MatPaginator = this.paginator;
    const modifier = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
    const umlaut = 'äöüßÄÖÜ'.includes(e.key);
    e.stopPropagation();
    if (this.letterKeyPressed(e.code) || umlaut) {
      e.preventDefault();
      if (!umlaut) {
        this.changedRowId = `row-${row}`;
        this.markUser(id, e.key);
      }
      return;
    }
    if (!modifier) {
      this.getValidActions(pg).forEach(k => e.code == k.key ? k.callback(id, el, pg, row, e) : false);
    }
  }

  private letterKeyPressed(code: string) {
    return (code >= 'KeyA' && code <= 'KeyZ') || code == 'Space';
  }

  private getValidActions(pg: MatPaginator) {
    return [
      { key: 'Enter', callback: this.edit.bind(this) },
      { key: 'ArrowUp', callback: this.prevRow },
      { key: 'ArrowDown', callback: this.nextRow },
      { key: 'PageUp', callback: this.prevPage },
      { key: 'PageDown', callback: this.nextPage },
      { key: 'Home', callback: pg.firstPage.bind(pg) },
      { key: 'End', callback: pg.lastPage.bind(pg) },
    ];
  }

  private edit(userId: string, el: any, pg: any, row: number, e: any) {
    this.editUser(userId);
    this.changedRowId = `row-${row}`;
  }

  private prevRow(a: any, el: any, b: any, r: number, ev: any) {
    if (r > 4) ev.preventDefault();
    el.prev ? el.prev.focus() : el.last.focus();
  }

  private nextRow(a: any, el: any, b: any, r: number, ev: any) {
    if (r < 4) ev.preventDefault();
    el.next ? el.next.focus() : el.first.focus();
  }

  private prevPage(a: any, b: any, pg: any) {
    pg.hasPreviousPage() ? pg.previousPage() : pg.lastPage();
  }

  private nextPage(a: any, b: any, pg: any) {
    pg.hasNextPage() ? pg.nextPage() : pg.firstPage();
  }

  private getTableElements(el: HTMLElement): object | any {
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
    const callback = (mutationList: any[]) => {  //the second parameter (= observer instance) is not needed here
      const ml = mutationList[0]; 
      const addedRow = ml.addedNodes[0];
      const removedRow = ml.removedNodes[0];
      const justMarkedRow = this.getJustMarkedRow(mutationList);
      if (addedRow && addedRow.nodeName == 'TR' && addedRow.id) {
        this.firstTableRow = addedRow.id == 'row-0' ? addedRow : this.firstTableRow;
      }
      if (justMarkedRow) {
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
        justMarkedRow.id == 'row-0' ? this.firstTableRow.focus() : justMarkedRow.focus();
        return;
      }
      if (addedRow && addedRow.nodeName == 'TR' && addedRow.id) {
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

  private getJustMarkedRow(ml:any[]): HTMLElement {
    return ml.filter(m =>
      m.addedNodes[0] && m.addedNodes[0].nodeName == 'TR'
        ? m.addedNodes[0].id == this.changedRowId
        : false
    )[0]?.addedNodes[0] || null;
  }

  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
}
