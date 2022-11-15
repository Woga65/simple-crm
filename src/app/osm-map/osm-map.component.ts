import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Map, ZoomAnimEvent , MapOptions, tileLayer, latLng, LeafletEvent } from 'leaflet';


@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.scss']
})

export class OsmMapComponent implements OnInit, OnDestroy {
  @Output() map$: EventEmitter<Map> = new EventEmitter;
  @Output() zoom$: EventEmitter<number> = new EventEmitter;
  @Input() options: MapOptions = {
                      layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        opacity: 0.7,
                        maxZoom: 19,
                        detectRetina: true,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      })],
                      zoom: 10,
                      center: latLng(50.550070000137225 , 9.681850024350837)
  };
  public map!: Map;
  public zoom: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.map.clearAllEventListeners;
    this.map.remove();
  }

  onMapReady(map: Map) {
    this.map = map;
    this.map$.emit(map);
    this.zoom = map.getZoom();
    this.zoom$.emit(this.zoom);
  }

  onMapZoomEnd(e: LeafletEvent | ZoomAnimEvent) {   //ZoomAnimEvent | any
    this.zoom = e.target.getZoom();
    this.zoom$.emit(this.zoom);
  }

  onMapZoomStart(e: any) {
    //console.log('zoom: ', e);
  }
}
