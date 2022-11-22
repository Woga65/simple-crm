import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Observable, Subscription } from 'rxjs';
import { Addr } from 'src/models/addr.class';
import { AddressComponent } from './address/address.component';
import { LangService } from './services/lang.service';
import { GeocodeService, GeoResult } from './services/geocode.service';
import { take } from 'rxjs';
import { Map } from 'leaflet';
import { Auth, User as AfUser } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnInit {
  title = 'simple-crm';
  navOpen: boolean = true;
  navMode: MatDrawerMode = 'side';

  subscription: Subscription = Subscription.EMPTY;
  addressComponent: AddressComponent | any = null; 
  fromAddressComponent: boolean = false;
  addressComponentLoaded: boolean = false;
  addrData: Addr = new Addr();

  geoData$: Subscription = Subscription.EMPTY;      // Observable<GeoResult> | Subscribable<GeoResult>;
  geoData: GeoResult = { spatialReference: {}, locations: [] };

  map!: Map;
  zoom: number = 0;
  mapCenter = { x: 0, y: 0, z: 0, text: '' };

  loggedIn: boolean = false;

  constructor(
    public geocodeService: GeocodeService,
    public langService: LangService,
    private afAuth: Auth 
    ) {}


  ngOnInit(): void {
    this.afAuth.onAuthStateChanged(this.loginChanged.bind(this));
  }


  loginChanged(afUser: AfUser | null) {
    this.loggedIn = !!afUser;
    console.log('logged in: ', this.loggedIn);
    console.log('afUser: ', afUser?.toJSON());
  }


  subscribeToEmitter(componentRef:any) {
    this.addressComponentLoaded = this.fromAddressComponent = false;
    if (componentRef instanceof AddressComponent) {
      this.addressComponent = componentRef;
      this.addressComponentLoaded = true;
      this.subscription = this.geoLocationSubscription();
    }
  }


  unsubscribe() {
    if (this.subscription && this.subscription != Subscription.EMPTY) {
      this.subscription.unsubscribe();
    }
  }


  receiveMap(map: Map) {
    this.map = map;
  }


  receiveZoom(zoom: number) {
    this.zoom = zoom;
  }


  geoLocationSubscription() {
    return this.addressComponent.showMapEvent.subscribe( (e:any) => {
      this.fromAddressComponent = this.addressComponentLoaded = true; // e['fromAddressList'];
      this.addrData = e['data'];
      this.geoData$ = (this.geocodeService.getLocationByAddress(this.addrData.zipCode, this.addrData.city, this.addrData.street) as Observable<GeoResult>)
        .pipe(take(1))
        .subscribe(geoData => this.geoData = this.showAddressLocation(geoData));
    });
  }


  showAddressLocation(geoData:GeoResult) {
    if (this.map) {
      this.mapCenter = this.getMapCenter(
        (geoData.locations[0]?.feature?.geometry?.x) || 0, 
        (geoData.locations[0]?.feature?.geometry?.y) || 0,
        `${ this.addrData.firstName } ${ this.addrData.lastName }`.trim()
      );
    };
    return geoData;
  }


  getMapCenter(x: number, y: number, text: string) {
    return { x: x, y: y, z: x || y ? 16 : 1, text: text };
  }

  
  localize() {
    return this.langService.getLocalFormat();
  }

}
