import { Component, OnInit, OnDestroy, QueryList, ViewChildren, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Addr } from 'src/models/addr.class';
import { AddrService } from '../services/addr.service';
import { LangService } from '../services/lang.service';
import { ChartEvent, ChartOptions, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})

export class StatisticsComponent implements OnInit, OnDestroy {
  private componentIsDestroyed$ = new Subject<boolean>();

  @ViewChildren(BaseChartDirective) charts!:QueryList<BaseChartDirective>;

  addr: Addr = new Addr();
  addresses: Addr[] = [];
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

  markStats = [ 'N/A', 'A', 'B', 'C', 'D', 'E-Z'];

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
    public addrService: AddrService,
    public langService: LangService,
  ) {}


  ngOnInit(): void {
    (this.addrService.getAddrList() as Observable<Addr[]>)
    .pipe(
      takeUntil(this.componentIsDestroyed$),
      map(addr => this.prepareAddrStatistics(addr))
    ).subscribe(addrData => {
      this.addresses = addrData;
      this.showAddrStatistics();
    });
  }


  ngOnDestroy(): void {
    this.componentIsDestroyed$.next(true);
    this.componentIsDestroyed$.complete();
  }


  prepareAddrStatistics(addr: Addr[]): Addr[] {
    this.ages = new Array(100).fill(0);
    this.markers = new Array(6).fill(0);
    return addr.map(u => {
      const age = this.calculateAge(u.birthDate);
      this.ages[age]++;
      const mark = (u.marker) ? u.marker.charCodeAt(1) - 64 : 0;
      this.markers[mark > 4 ? 5 : mark]++;
      console.log(u.firstName, u.lastName, age, 'years old', 'marker: ', u.marker);
      u.birthDate = u.birthDate ? new Date(u.birthDate).toLocaleDateString() : '';
      return u;
    });
  }


  showAddrStatistics() {
    this.ageStats.forEach( (s: any, index: number) => {
      this.ageChartLabels[index] = s.legend;
      (this.ageChartData[0].data[index] as number) = this.ages
        .filter((n, i) => i >= s.from && i <= s.to).reduce((t, v) => t + v);
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
