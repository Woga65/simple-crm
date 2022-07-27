import { Component } from '@angular/core';
//import { AngularFirestore } from '@angular/fire/compat/firestore';
//import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'simple-crm';
  //items: Observable<any[]> | any;

  //constructor(firestore: AngularFirestore) {
    //this.items = firestore.collection('items').valueChanges();
  //}
}
