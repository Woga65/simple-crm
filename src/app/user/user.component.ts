import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, AfterViewChecked, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, take } from 'rxjs/operators';
import { User } from 'src/models/user.class';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { UserService } from '../services/user.service';
import { LangService } from '../services/lang.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class UserComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  private componentIsDestroyed$ = new Subject<boolean>();
  private dataFilterChanged$ = new Subject<boolean>();

  user: User = new User();
  users: User[] = [];

  displayedColumns: string[] = ['position', 'firstName', 'lastName', 'eMail', 'city', 'marker'];
  dataSource: any;    // MatTableDataSource

  pageIndex: number = 0;
  firstTableRow: ElementRef<HTMLTableRowElement> | any;
  tableObserver!: MutationObserver;
  changedRowId: string = '';
  forceFocus: boolean = false;
  filterValue: string = '';

  // the letters available for marking a data record using the mouse   
  // if using the keyboard, the letters A-Z plus Space are available
  markers: string = ' ABCD';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort = new MatSort();

  showMapEvent = new EventEmitter();

  constructor(public dialog: MatDialog, 
    public userService: UserService,
    private _liveAnnouncer: LiveAnnouncer,
    public langService: LangService,
  ) { }


  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.tableObserver = this.observeUserTable();
    this.initUsersList();
    this.changedRowId = 'row-0';
  }


  ngOnDestroy() {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
    this.tableObserver.disconnect();
  }


  localize() {
    return this.langService.getLocalFormat();
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
    this.forceFocus = false;
    const dialogRef = this.dialog.open(DialogAddUserComponent, { data: { user: user }, disableClose: true });
    dialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res) {
        this.showMapEvent.emit({ data: res.user || user });
      }
    });
  }


  initUsersList() {
    this.getUsersList().subscribe(userData => {
      console.log('Neue Daten sind verfügbar: ', userData);
      this.users = this.filterUserData(userData, this.filterValue);
      this.dataSource = new MatTableDataSource(this.users);
      this.dataSource.sortingDataAccessor = ((row:User, name:string) => {
        return (name == 'marker' && !row.marker)
          ? ( this.dataSource.sort.direction == 'asc' ? '=z' : '= ' ) 
          : row[name as keyof User];
      });
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }


  getUsersList() {
    return (this.userService.getUserList() as Observable<User[]>)
      .pipe(
        takeUntil(this.componentIsDestroyed$ && this.dataFilterChanged$),
        map(usr => this.userBirthDateToString(usr))
      );
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
      for (const prop in u) {
        if (prop != 'id' && (u[prop as keyof User] as string).toLowerCase().includes(f)) return true;
      }
      return false;
    });
  }


  userBirthDateToString(user: User[]): User[] {
    return user.map(u => {
      u.birthDate = u.birthDate ? new Date(u.birthDate).toDateString() : '';
      return u;
    });
  }


  userFocussed(ev:any, userData: User, row: number) {
    this.showMapEvent.emit({ data: userData });
  }


  /**
   * Mark a data record with a single letter 
   * by clicking the marker-column
   * 
   * @param { string } userId - the user's Id 
   * @param { string } m - the letter, the user was marked before 
   * @param { number } row - the number of the row that has been clicked 
   * @param { Event } ev - mouse event 
   */
  markUserByMouse(userId: string, m:string, row: number, ev:any) {
    ev.stopPropagation();
    const mIndex = this.markers.indexOf(m) == -1 ? 0 : this.markers.indexOf(m);
    const marker = mIndex < this.markers.length - 1 ? this.markers.charAt(mIndex + 1) : this.markers.charAt(0);
    this.changedRowId = `row-${row}`;
    this.markUser(userId, marker);
  }


  /**
   * if the table row already was focussed, edit the user 
   * represented by that specific table row. Otherwise
   * move the focus to that specific row.
   * 
   * @param { string } userData - the user's Record
   * @param { number } row - the number of the row that has been clicked
   */
  editUserByMouse(userData: User, row: number) {
    if (this.changedRowId == `row-${row}`) this.editUser(userData.id);
    this.changedRowId = `row-${row}`;
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
    this.forceFocus = true;
    e.stopPropagation();
    if (this.letterKeyPressed(e.code) || this.isUmlaut(e.key)) {
      e.preventDefault();
      this.markUserIfValidLetter(id, row, e);
    } else {
      this.checkNavigationKeys(id, row, e);
    }
  }


  private markUserIfValidLetter(id: any, row: any, e: KeyboardEvent) {
    if (!this.isUmlaut(e.key) && !this.modifier(e)) {
      this.changedRowId = `row-${row}`;
      this.markUser(id, e.key);
    }
  }


  private checkNavigationKeys(id: any, row: any, e: KeyboardEvent) {
    if (!this.modifier(e)) {
      const el = this.getTableElements(e.target as HTMLElement);
      const pg: MatPaginator = this.paginator;
      this.getValidActions(pg).forEach(k => e.code == k.key ? k.callback(id, row, el, pg, e) : false);
    }
  }


  private isUmlaut(key: string) {
    return 'äöüßÄÖÜ'.includes(key)
  }


  private modifier(e:KeyboardEvent) {
    return e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.key == "AltGraph";
  }


  checkModifiedKeys(e: KeyboardEvent, id: any, row: any = 0) {
    if (e.altKey && e.code == 'KeyN') {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.newUser();
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
    const observer = new MutationObserver(this.observerCallback.bind(this));
    observer.observe(table, options);
    return observer;
  }


  observerCallback(mutationList: any[]) {     //the second parameter (= observer instance) is not needed here
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
    if (this.changedRowId && this.forceFocus) {
      document.getElementById(this.changedRowId)?.focus();
    }
  }

}

  /*
  for queries / server side filtering:
  
  getUsersList() {
    return (this.userService.selectFromUserWhere('marker', '>=', '=A', 'desc') as Observable<User[]>)
      .pipe(...);
  }
  */