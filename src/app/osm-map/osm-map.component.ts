import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Map, ZoomAnimEvent , MapOptions, tileLayer, latLng, LeafletEvent, marker } from 'leaflet';


@Component({
  selector: 'app-osm-map',
  templateUrl: './osm-map.component.html',
  styleUrls: ['./osm-map.component.scss']
})

export class OsmMapComponent implements OnInit, OnDestroy, OnChanges {
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
  @Input('center') center = { x: 9.681850024350837, y: 50.550070000137225, z: 10, text: '' };
  public map!: Map;
  public zoom: number = 1;
  marker: any = null;

  constructor() { }


  ngOnInit(): void {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['center']) {
      this.removePreviousMarker(this.marker);
      this.setCenter();
      this.marker = this.setMarker();
      this.addTextToMarker(this.marker, this.center.text);
    }
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
  }


  setCenter() {
    if (this.map) {
      this.map.setView(latLng(this.center.y, this.center.x), this.center.z);
    }
  }


  setMarker() {
    return (this.center.x || this.center.y) && this.map ? marker(latLng(this.center.y, this.center.x)).addTo(this.map) : null;
  }


  addTextToMarker(marker: any, text: string) {
    if (marker && text) marker.bindTooltip(text, {
      permanent: true, 
      direction : 'bottom',
      className: 'transparent-tooltip',
      offset: [-16, 32]
    });
  }


  removePreviousMarker(marker: any) {
    if (marker) this.map.removeLayer(marker);
  }

}