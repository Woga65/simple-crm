import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/models/user.class';
import { UserComponent } from './user/user.component';
import { LangService } from './services/lang.service';
import { GeocodeService, GeoResult } from './services/geocode.service';
import { take } from 'rxjs';
import { Map } from 'leaflet';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent {
  title = 'simple-crm';
  navOpen: boolean = true;
  navMode: MatDrawerMode = 'side';

  subscription: Subscription = Subscription.EMPTY;
  userComponent: UserComponent | any = null; 
  fromUserComponent: boolean = false;
  userComponentLoaded: boolean = false;
  userData: User = new User();

  geoData$: Subscription = Subscription.EMPTY;      // Observable<GeoResult> | Subscribable<GeoResult>;
  geoData: GeoResult = { spatialReference: {}, locations: [] };

  map!: Map;
  zoom: number = 0;
  mapCenter = { x: 0, y: 0, z: 0, text: '' };

  constructor(
    public geocodeService: GeocodeService,
    public langService: LangService,
    ) {}


  subscribeToEmitter(componentRef:any) {
    this.userComponentLoaded = this.fromUserComponent = false;
    if (componentRef instanceof UserComponent) {
      this.userComponent = componentRef;
      this.userComponentLoaded = true;
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
    return this.userComponent.showMapEvent.subscribe( (e:any) => {
      this.fromUserComponent = this.userComponentLoaded = true; // e['fromUserList'];
      this.userData = e['data'];
      this.geoData$ = (this.geocodeService.getLocationByAddress(this.userData.zipCode, this.userData.city, this.userData.street) as Observable<GeoResult>)
        .pipe(take(1))
        .subscribe(geoData => this.geoData = this.showUsersLocation(geoData));
    });
  }


  showUsersLocation(geoData:GeoResult) {
    if (this.map) {
      this.mapCenter = this.getMapCenter(
        (geoData.locations[0]?.feature?.geometry?.x) || 0, 
        (geoData.locations[0]?.feature?.geometry?.y) || 0,
        `${ this.userData.firstName } ${ this.userData.lastName }`.trim()
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
