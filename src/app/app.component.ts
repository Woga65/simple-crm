import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'simple-crm';
  navOpen: boolean = true;
  navMode: MatDrawerMode = 'side';

  constructor() {}
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