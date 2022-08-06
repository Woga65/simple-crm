import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
//import { catchError, retry } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PlzService {

  corsProxy = true;

  corsAnywhereUrl: string = this.corsProxy ? 'https://cors-anywhere.herokuapp.com/' : 'https://robwu.nl/';
  plzServerUrl: string = this.corsAnywhereUrl + 'https://www.postdirekt.de/plzserver/PlzAjaxServlet';


  constructor(private http: HttpClient) { }


  getPostCodeByAddress(plz = '34', city = 'kassel', street = 'frankfurter str. 45', finda = 'plz') {
    const options = {
      params: new HttpParams({ fromString: PlzService.postCodeQueryTemplate(plz, city, street, finda) }) 
    }; 
    return this.http.get<Plz>(this.plzServerUrl, options)
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


  static postCodeQueryTemplate(plz = '', city = '', street = '', finda = 'plz') {  //// no records if full PLZ is supplied
    return `?plz_city=${city}&plz_plz=${plz}&plz_street=${street}&finda=${finda}&plz_city_clear&plz_ditrict=&lang=de_DE`;
  }
  static cityQueryTemplate(plz = '', city = '', street = '', finda = 'city') {   //// finds city for a given PLZ
    return `?finda=${finda}&city=${plz}&lang=de_DE`;
  }
  static streetQueryTemplate(plz = '', city = '', street = '', finda = 'streets') {   //// can create a huge amount of data
    return `?finda=${finda}&plz_plz=${plz}&plz_city=${city}&plz_district=&lang=de_DE`;
  }

}


export interface Plz {
  count: number,
  finda: string,
  header: object,
  rows: PlzRow[],   //Array<object>,
  searchString: string,
  success: boolean,
  switchTo: string,
}

export interface PlzRow {
  city: string,
  cityaddition?: string,
  district?: string,
  map: boolean,
  number?: string,
  plz: string,
  street?: string,
  districtlink?: boolean,
  streetlink?:boolean,
}


