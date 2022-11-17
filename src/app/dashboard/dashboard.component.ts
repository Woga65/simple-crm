import { Component, OnInit, AfterViewInit, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { User } from 'src/models/user.class';
import { UserService } from '../services/user.service';
import { LangService } from '../services/lang.service';
import { ChartEvent, ChartOptions, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  @ViewChildren(BaseChartDirective) charts!:QueryList<BaseChartDirective>;

  user: User = new User();
  users$: Observable<User[]>;
  users: User[] = [];
  ages: number[] = [];
  markers: number[] = [];

  ageStats = [
    { legend: 'N/A', from: 0, to: 0 },
    { legend: '< 18', from: 1, to: 17 },
    { legend: '18-29', from: 18, to: 29 },
    { legend: '30-39', from: 30, to: 39 },
    { legend: '40-49', from: 40, to: 49 },
    { legend: '50-59', from: 50, to: 59 },
    { legend: '>= 60', from: 60, to: 99 },
  ];

  markStats = [ 'N/A', 'A', 'B', 'C', 'D', 'E-Z']

  ageChartData = [ { data: [] } ];
  markChartData = [ { data: [] } ];

  ageChartLabels: string[] = [];
  markChartLabels: string[] = [];

  ageChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        onHover: e => e.native ? (e.native.target as HTMLElement).style.cursor = 'pointer' : false,
        onLeave: e => e.native ? (e.native.target as HTMLElement).style.cursor = 'default' : false,
        position: 'top', align: 'center',
      },
      
    }

  };


  constructor(
    public userService: UserService,
    public langService: LangService,
  ) {
  
    this.users$ = this.userService.getUserList() as Observable<User[]>;
    this.users$.pipe(
      takeUntil(this.componentIsDestroyed$),
      map(usr => this.prepareUserStatistics(usr))
    ).subscribe(userData => {
      this.users = userData;
      this.showUserStatistics();
    });
  }

  ngOnInit(): void {
    console.log(this.langService.getLocale());
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }

  prepareUserStatistics(user: User[]): User[] {
    this.ages = new Array(100).fill(0);
    this.markers = new Array(6).fill(0);
    return user.map(u => {
      const age = this.calculateAge(u.birthDate);
      this.ages[age]++;
      const mark = (u.marker) ? u.marker.charCodeAt(1) - 64 : 0;
      this.markers[mark > 4 ? 5 : mark]++;
      console.log(u.firstName, u.lastName, age, 'years old', 'marker: ', u.marker);
      u.birthDate = u.birthDate ? new Date(u.birthDate).toLocaleDateString() : '';
      return u;
    });
  }

  showUserStatistics() {
    this.ageStats.forEach( (s: any, index: number) => {
      this.ageChartLabels[index] = s.legend;
      (this.ageChartData[0].data[index] as number) = this.ages.filter((n, i) => i >= s.from && i <= s.to).reduce((t, v) => t + v);
    });
    this.markChartLabels = this.markStats;
    (this.markChartData[0].data as number[]) = this.markers;
    this.charts.forEach(chart => chart.update());   //chart.chart?.update());
  }

  calculateAge(birthDate: string | number) {
      const diffMillies = Date.now() - new Date(birthDate).getTime();
      return birthDate ? Math.abs(new Date(diffMillies).getUTCFullYear() - 1970) : 0;
  }

  localize() {
    return this.langService.getLocalFormat();
  }

}
