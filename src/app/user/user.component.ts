import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, AfterViewChecked } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../user.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
//import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  private componentIsDestroyed$ = new Subject<boolean>();
  private dataFilterChanged$ = new Subject<boolean>();

  user: User = new User();
  users$: Observable<User[]>;
  users: User[] = [];

  displayedColumns: string[] = ['position', 'lastName', 'eMail', 'city', 'marker'];
  dataSource: any;    // MatTableDataSource

  pageIndex: number = 0;
  firstTableRow: ElementRef<HTMLTableRowElement> | any;
  tableObserver!: MutationObserver;
  changedRowId: string = '';
  dialogLostFocus: boolean = false;
  filterValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort = new MatSort();


  constructor(public dialog: MatDialog, public userService: UserService, private _liveAnnouncer: LiveAnnouncer) {
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
    this.dialogLostFocus = false;
    const dialogRef = this.dialog.open(DialogAddUserComponent, { data: { user: user } });
    dialogRef.afterClosed().subscribe(res => {
      console.log('res: ', res);
      this.dialogLostFocus = true;
    });
  }


  initUsersList() {
    this.users$.pipe(
      takeUntil(this.componentIsDestroyed$ && this.dataFilterChanged$),
      map(usr => this.userBirthDateToString(usr))
    ).subscribe(userData => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = this.filterUserData(userData, this.filterValue);
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = ((row:User, name:string) => {
        return (name == 'marker' && !row.marker)
          ? ( this.dataSource.sort.direction == 'asc' ? 'z' : ' ' ) 
          : row[name as keyof User];
      });
    });
  }


  sortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
    console.log(sortState.direction ? `${sortState.active} sorted ${sortState.direction}ending` : `sorting cleared`);
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase() ;
    this.dataFilterChanged$.next(true);
    this.dataFilterChanged$.complete();
    this.initUsersList();
  }


  filterUserData(user: User[], f: string): User[] {
    return user.filter(u => {
      for (const prop in u) 
        if ((u[prop as keyof User] as string).toLowerCase().includes(f)) return true;
      return false;
    });
  }


  userBirthDateToString(user: User[]): User[] {
    return user.map(u => {
      u.birthDate = new Date(u.birthDate).toLocaleDateString();
      return u;
    });
  }



  /*****************************
   **   Keyboard navigation   **
   *****************************

  /**
   * Check for keys to navigate the
   * table by keyboard
   * 
   * @param { KeyboardEvent } e 
   * @param { string } id - user Id
   * @param { number } row - row number 
   * @returns - undefined
   */
  checkKeys(e: KeyboardEvent, id: any, row: any = 0) {
    this.changedRowId = '';
    this.dialogLostFocus = true;
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
      this.getValidActions(pg).forEach(k => e.code == k.key ? k.callback(id, row, el, pg, e) : false);
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

  private edit(userId: string, row: number) {
    this.changedRowId = `row-${row}`;
    this.editUser(userId);
  }

  private prevRow(id: any, row: number, el: any, pg: any, ev: any) {
    if (row > 4) ev.preventDefault();
    el.prev ? el.prev.focus() : el.last.focus();
  }

  private nextRow(id: any, row: number, el: any, pg: any, ev: any) {
    if (row < 4) ev.preventDefault();
    el.next ? el.next.focus() : el.first.focus();
  }

  private prevPage(id: any, row: any, el: any, pg: any) {
    pg.hasPreviousPage() ? pg.previousPage() : pg.lastPage();
  }

  private nextPage(id: any, row: any, el: any, pg: any) {
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


  /*****************************
   **   Methods related to    **
   **   focus Management      **
   *****************************/

  /**
   * Allow to override the keyboard navigation
   * for the filter input field to get focus
   * 
   * @param { object } ev - mouse event 
   */
  filterInputClicked(ev: Event) {
    this.changedRowId = '';
    (ev.target as HTMLElement).focus();
  }


  /**
   * Mutation Observer to maintain consistent
   * focus during keyboard navigation 
   * 
   * @returns { MutationObserver } 
   */
  observeUserTable(): MutationObserver {
    const table: HTMLTableElement | any = document.querySelector('table');
    const options = { childList: true, subtree: true };
    const callback = (mutationList: any[]) => {  //the second parameter (= observer instance) is not needed here
      this.dataSource.sort = this.sort;
      const addedRow = this.getAddedRow(mutationList);
      const removedRow = this.getRemovedRow(mutationList);
      this.firstTableRow = this.getfirstRow(mutationList) || this.firstTableRow;
      if (this.changedRowId) {
        document.getElementById(this.changedRowId)?.focus();
        return;
      }
      if ((addedRow || removedRow) && !this.changedRowId) { 
        this.firstTableRow.focus();
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(table, options);
    return observer;
  }

  private getAddedRow(ml:any[]): HTMLElement {
    return ml.filter(m =>
      m.addedNodes[0] && m.addedNodes[0].nodeName == 'TR' && m.addedNodes[0].id
    )[0]?.addedNodes[0] || null;
  }

  private getRemovedRow(ml:any[]): HTMLElement {
    return ml.filter(m =>
      m.removedNodes[0] && m.removedNodes[0].nodeName == 'TR' && m.removedNodes[0].id
    )[0]?.removedNodes[0] || null;
  }

  private getfirstRow(ml:any[]): HTMLElement {
    return ml.filter(m =>
      m.addedNodes[0] && m.addedNodes[0].nodeName == 'TR' && m.addedNodes[0].id
        ? m.addedNodes[0].id == 'row-0'
        : false
    )[0]?.addedNodes[0] || null;
  }

  ngAfterViewChecked(): void {
    if (this.changedRowId && this.dialogLostFocus) {
      document.getElementById(this.changedRowId)?.focus();
    }
  }

}


  /*private getJustMarkedRow(ml:any[]): HTMLElement {
    return ml.filter(m =>
      m.addedNodes[0] && m.addedNodes[0].nodeName == 'TR' && m.addedNodes[0].id
        ? m.addedNodes[0].id == this.changedRowId
        : false
    )[0]?.addedNodes[0] || null;
  }*/

  /*getUser(userId:string) {
    const docRef = doc(this.coll, userId);
    onSnapshot(docRef, doc => {
      this.user = new User(doc.data() || {});
      const dialogRef:any = this.dialog.open(DialogAddUserComponent, { data:{ user: this.user } });
    });
  }*/
