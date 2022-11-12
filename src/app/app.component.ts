import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { UserComponent } from './user/user.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'simple-crm';
  navOpen: boolean = true;
  navMode: MatDrawerMode = 'side';

  subscription!: Subscription;
  fromChild: boolean = false;

  constructor() {}

  subscribeToEmitter(componentRef:any) {
    if (!(componentRef instanceof UserComponent)) return;
    const child:UserComponent = componentRef;
    this.subscription = child.showMapEvent.subscribe( (e:any) => {
      console.log('e: ', e);      //a map showing the users address will go here 
      this.fromChild = e['fromUserList']; 

    });
  }

  unsubscribe() {
    this.subscription.unsubscribe();
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