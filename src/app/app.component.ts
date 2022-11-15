import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Observable, Subscribable, Subscription } from 'rxjs';
import { User } from 'src/models/user.class';
import { UserComponent } from './user/user.component';
import { GeocodeService, GeoResult } from './services/geocode.service';
import { tap, take } from 'rxjs';
import { Map, latLng, marker } from 'leaflet';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'simple-crm';
  navOpen: boolean = true;
  navMode: MatDrawerMode = 'side';

  subscription: Subscription = Subscription.EMPTY;
  fromChild: boolean = false;
  userData: User = new User();

  geoData$: Subscription = Subscription.EMPTY;      // Observable<GeoResult> | Subscribable<GeoResult>;
  geoData: GeoResult = { spatialReference: {}, locations: [] };

  map!: Map;
  zoom: number = 0;
  marker: any = null;

  constructor(public geocodeService: GeocodeService) {}

  subscribeToEmitter(componentRef:any) {
    if (!(componentRef instanceof UserComponent)) {
      this.fromChild = false;
      return;
    }
    this.subscription = this.geoLocationSubscription(componentRef);
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


  geoLocationSubscription(componentRef:any) {
    const child:UserComponent = componentRef;
    return child.showMapEvent.subscribe( (e:any) => {
      this.fromChild = e['fromUserList'];
      this.userData = new User(e['data']);
      this.geoData$ = (this.geocodeService.getLocationByAddress(this.userData.zipCode, this.userData.city, this.userData.street) as Observable<GeoResult>)
        .pipe(take(1))
        .subscribe(geoData => this.geoData = this.showUsersLocation(geoData));
    });
  }


  showUsersLocation(geoData:GeoResult) {
    if (this.map) {
      this.removePreviousMarker();
      this.marker = this.markUserOnMap(geoData);
      this.addUserInfoToMarker();
    } 
    return geoData;
  }


  removePreviousMarker() {
    if (this.marker) this.map.removeLayer(this.marker);
  }


  markUserOnMap(geoData:GeoResult) {
    const x = (geoData.locations[0]?.feature?.geometry?.x) || 0;
    const y = (geoData.locations[0]?.feature?.geometry?.y) || 0;
    this.map.setView(latLng(y, x), (x || y) ? 16 : 1);
    return (geoData.locations.length) ? marker(latLng(y, x)).addTo(this.map) : null;
  }


  addUserInfoToMarker() {
    if (this.marker) this.marker.bindTooltip(`${ this.userData.firstName } ${ this.userData.lastName }`, {
      permanent: true, 
      direction : 'bottom',
      className: 'transparent-tooltip',
      offset: [-16, 32]
    });
  }

}


//import { AngularFirestore } from '@angular/fire/compat/firestore';
//import { Observable } from 'rxjs';

//@Component({
// ...  
//})

// export class AppComponent {}
//items: Observable<any[]> | any;
// ...

  //constructor(firestore: AngularFirestore) {
    //this.items = firestore.collection('items').valueChanges();
  //}