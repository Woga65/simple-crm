import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class GeocodeService {

  geoServerUrl: string = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';

  constructor(private http: HttpClient) { }


  getLocationByAddress(plz = '34119', city = 'kassel', street = 'frankfurter str. 45') {
    const options = {
      params: new HttpParams({ fromString: GeocodeService.geoQueryTemplate(plz, city, street) }) 
    }; 
    return this.http.get<GeoResult>(this.geoServerUrl, options)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error(`Network Error: ${error.error} - ${error.message}`);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(()=> new Error('Something bad happened; please try again later.'));
  }


  static geoQueryTemplate(plz = '36119', city = 'kassel', street = 'nebelthaustr. 5') {    // finds location for a given address
    return `?text=${plz},${city},${street}&f=pjson`;
  }
}



export interface GeoResult {
  spatialReference: any,
  locations: GeoLocation[],
}

export interface GeoLocation {
  name?: string,
  extent?: { xmin?: number, ymin?: number, xmax?: number, ymax?: number },
  feature?: { geometry?: Geometry, attributes?: any },
}

export interface Geometry {
  x?: number,
  y?: number,
}