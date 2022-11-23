import { Component, OnInit } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { LangService } from '../services/lang.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loggedIn: boolean = false;
  providers = AuthProvider;

  constructor(private auth: Auth, private router: Router, public langService: LangService) { }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(this.loginChanged.bind(this));
  }


  onLogin(e:Event) {
    this.router.navigate(['']);
  }


  loginChanged(user: User | null) {
    this.loggedIn = !!user;
    console.log('logged in: ', this.loggedIn);
    console.log('User: ', user?.toJSON());
  }

  
  localize() {
    return this.langService.getLocalFormat();
  }

}
