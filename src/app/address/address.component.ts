import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AfterViewChecked, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, take } from 'rxjs/operators';
import { Addr } from 'src/models/addr.class';
import { DialogAddAddressComponent } from '../dialog-add-address/dialog-add-address.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { AddrService } from '../services/addr.service';
import { LangService } from '../services/lang.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class AddressComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  private componentIsDestroyed$ = new Subject<boolean>();
  private dataFilterChanged$ = new Subject<boolean>();

  address: Addr = new Addr();
  addresses: Addr[] = [];

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
    public addrService: AddrService,
    private _liveAnnouncer: LiveAnnouncer,
    public langService: LangService,
  ) { }


  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.tableObserver = this.observeAddressTable();
    this.initAddressList();
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

 
  newAddress() {
    this.openDialog(new Addr);
    this.changedRowId = 'row-0';
  }


  async editAddress(addrId: string) {
    await this.getAddress(addrId);
    this.openDialog(this.address);
  }


  async markAddress(addrId: string, marker: string) {
    const m = (marker && marker == ' ') ? '' : '=' + marker.toUpperCase();
    await this.getAddress(addrId);
    this.address.marker = m;
    await this.addrService.updateAddr(this.address);
    console.log('address marked: ', addrId, '/', marker);
  }


  async getAddress(addrId: string) {
    this.address = new Addr(await this.addrService.getAddrDoc(addrId));
    console.log('address read: ', this.address.toJSON());
  }


  openDialog(addr: Addr = new Addr) {
    this.forceFocus = false;
    const dialogRef = this.dialog.open(DialogAddAddressComponent, { data: { address: addr }, disableClose: true });
    dialogRef.afterClosed().pipe(take(1)).subscribe(res => {
      if (res && res.address.id) {
        this.showMapEvent.emit({ data: res.address || addr });
      } else {
        this.forceFocus = true;
      }
    });
  }


  initAddressList() {
    this.getAddressList().subscribe(addrData => {
      console.log('Neue Daten sind verfügbar: ', addrData);
      this.addresses = this.filterAddressData(addrData, this.filterValue);
      this.dataSource = new MatTableDataSource(this.addresses);
      this.dataSource.sortingDataAccessor = ((row:Addr, name:string) => {
        return (name == 'marker' && !row.marker)
          ? ( this.dataSource.sort.direction == 'asc' ? '=z' : '= ' ) 
          : row[name as keyof Addr];
      });
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }


  getAddressList() {
    return (this.addrService.getAddrList() as Observable<Addr[]>)
      .pipe(
        takeUntil(this.componentIsDestroyed$ && this.dataFilterChanged$),
        map(addr => this.addrBirthDateToString(addr))
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
    this.initAddressList();
  }


  filterAddressData(addr: Addr[], f: string): Addr[] {
    return addr.filter(a => {
      for (const prop in a) {
        const v = (prop.toLowerCase().includes('date'))
          ? new Date(((a[prop as keyof Addr] as string) || '')).toLocaleDateString()
          : (prop != 'id') ? ((a[prop as keyof Addr]) || '').toString().toLowerCase() : '';
        if (v.includes(f) || (prop != 'id' && ((a[prop as keyof Addr]) || '').toString().toLowerCase().includes(f)) ) return true;
      }
      return false;
    });
  }


  addrBirthDateToString(addr: Addr[]): Addr[] {
    return addr.map(a => {
      a.birthDate = a.birthDate ? new Date(a.birthDate).toDateString() : '';
      return a;
    });
  }


  addressFocussed(ev:any, addrData: Addr, row: number) {
    this.showMapEvent.emit({ data: addrData });
  }


  /**
   * Mark a data record with a single letter 
   * by clicking the marker-column
   * 
   * @param { string } addrId - the address Id 
   * @param { string } m - the letter, the addr was marked before 
   * @param { number } row - the number of the row that has been clicked 
   * @param { Event } ev - mouse event 
   */
  markAddressByMouse(addrId: string, m:string, row: number, ev:any) {
    ev.stopPropagation();
    const mIndex = this.markers.indexOf(m) == -1 ? 0 : this.markers.indexOf(m);
    const marker = mIndex < this.markers.length - 1 ? this.markers.charAt(mIndex + 1) : this.markers.charAt(0);
    this.changedRowId = `row-${row}`;
    this.markAddress(addrId, marker);
  }


  /**
   * if the table row already was focussed, edit the addr 
   * represented by that specific table row. Otherwise
   * move the focus to that specific row.
   * 
   * @param { string } addrData - the addr's Record
   * @param { number } row - the number of the row that has been clicked
   */
  editAddressByMouse(addrData: Addr, row: number) {
    if (this.changedRowId == `row-${row}`) this.editAddress(addrData.id);
    this.changedRowId = `row-${row}`;
    this.forceFocus = false;
  }


  /*****************************
   **   Keyboard navigation   **
   *****************************

  /**
   * Check for keys to navigate the
   * table by keyboard
   * 
   * @param { KeyboardEvent } e 
   * @param { string } id - address Id
   * @param { number } row - row number 
   */
  checkKeys(e: KeyboardEvent, id: any, row: any = 0) {
    this.changedRowId = '';
    this.forceFocus = true;
    e.stopPropagation();
    if (this.letterKeyPressed(e.code) || this.isUmlaut(e.key)) {
      e.preventDefault();
      this.markAddressIfValidLetter(id, row, e);
    } else {
      this.checkNavigationKeys(id, row, e);
    }
  }


  private markAddressIfValidLetter(id: any, row: any, e: KeyboardEvent) {
    if (!this.isUmlaut(e.key) && !this.modifier(e)) {
      this.changedRowId = `row-${row}`;
      this.markAddress(id, e.key);
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
      this.newAddress();
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


  private edit(addrId: string, row: number) {
    this.changedRowId = `row-${row}`;
    this.editAddress(addrId);
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
  observeAddressTable(): MutationObserver {
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
  
  getAddressList() {
    return (this.addrService.selectFromAddrWhere('marker', '>=', '=A', 'desc') as Observable<Addr[]>)
      .pipe(...);
  }
  */