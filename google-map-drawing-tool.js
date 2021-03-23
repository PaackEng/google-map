import { Polymer } from "@polymer/polymer/lib/legacy/polymer-fn.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";

Polymer({
  _template: html`
    <dom-module id="google-map-drawing-tool">
      <template>
        <style>
          :host {
            display: none;
          }
        </style>
        <content></content>
      </template>
    </dom-module>
  `,
  is: "google-map-drawing-tool",

  properties: {
    map: {
      type: Object,
      observer: "_mapLoaded",
    },
    polygonColor: {
      type: String,
      value: "#169FFF",
    },
    disabled: {
      type: Object,
      observer: "_disabledChanged",
    },
  },
  detached: function () {
    if (this.currentPolygon) {
      this.currentPolygon.setMap(null);
      this.currentPolygon = null;
    }
  },
  _disabledChanged: function () {
    // Clears fishined polygons
    if (this.currentPolygon) {
      this.currentPolygon.setMap(null);
      this.currentPolygon = null;
    }

    if (this.manager) {
      this.manager.setMap(this.disabled ? null : this.map);

      // Clears unfishined polygons
      this.manager.setDrawingMode(null);
      this.manager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  },
  _mapLoaded: function () {
    if (this.manager) {
      return;
    }

    if (this.map !== null && !this.manager) {
      this.manager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        drawingControlOptions: {},
        polygonOptions: {
          strokeColor: this.polygonColor,
          strokeOpacity: 0.8,
          strokeWeight: 4,
          fillColor: this.polygonColor,
          fillOpacity: 0.35,
        },
      });

      this.manager.setMap(this.disabled ? null : this.map);

      google.maps.event.addListener(
        this.manager,
        "polygoncomplete",
        function (event) {
          if (!this.disabled) {
            this.currentPolygon = event;

            console.log("vrau");

            this.manager.setDrawingMode(null);

            const result = event
              .getPath()
              .getArray()
              .map((point) => ({ lat: point.lat(), lng: point.lng() }));

            this.fire("on-polygon-completed", result);
          }
        }.bind(this)
      );
    }
  },
});
