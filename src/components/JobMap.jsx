import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin, Compass } from 'lucide-react';

// Setup custom Leaflet DivIcons for style customization and to avoid asset loading bugs in Vite.
const createJobIcon = (emoji, isActive, isLiveEvent) => {
  if (isLiveEvent) {
    return L.divIcon({
      html: `
        <div class="live-beacon-container">
          <div class="live-beacon-ring"></div>
          <div class="live-beacon-core ${isActive ? 'active' : ''}">🚨</div>
        </div>
      `,
      className: 'custom-leaflet-icon',
      iconSize: [45, 45],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22]
    });
  }

  return L.divIcon({
    html: `<div class="custom-marker ${isActive ? 'active' : ''}">${emoji || '💼'}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const userIcon = L.divIcon({
  html: '<div class="user-location-marker" title="You are here"></div>',
  className: 'user-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<div class="cluster-marker"><span>${cluster.getChildCount()}</span></div>`,
    className: 'custom-leaflet-cluster',
    iconSize: L.point(40, 40, true),
  });
};

// A sub-component to handle map movements and double-clicks
function MapController({ onBoundsChange, onMapDoubleClick, centerTo }) {
  const map = useMap();

  // Handle programmatic zooming/panning
  useEffect(() => {
    if (centerTo) {
      map.setView([centerTo.lat, centerTo.lng], centerTo.zoom || 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [centerTo, map]);

  // Report initial bounds once map is ready
  useEffect(() => {
    const reportBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
      });
    };
    
    // Give leaflet a millisecond to draw, then report
    const timer = setTimeout(reportBounds, 100);
    return () => clearTimeout(timer);
  }, [map, onBoundsChange]);

  // Register map event listeners
  useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
      });
    },
    dblclick: (e) => {
      // Trigger new job creation
      onMapDoubleClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });

  return null;
}

export default function JobMap({
  jobs,
  selectedJob,
  onSelectJob,
  onBoundsChange,
  onMapDoubleClick,
  centerTo,
  setCenterTo,
  userLocation,
  setUserLocation,
  isLightMode
}) {
  const defaultCenter = [20, 0]; // World view
  const defaultZoom = 2.5;

  // Prompt user for geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          // Set map camera view to center on user
          setCenterTo({ lat: coords.lat, lng: coords.lng, zoom: 11 });
        },
        (error) => {
          console.warn('Geolocation failed or denied by user:', error.message);
          // Default center: Hyderabad, India
          setCenterTo({ lat: 17.44829, lng: 78.39148, zoom: 12 });
        }
      );
    } else {
      // Fallback
      setCenterTo({ lat: 17.44829, lng: 78.39148, zoom: 12 });
    }
  }, [setUserLocation, setCenterTo]);

  return (
    <div className="map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={true}
        doubleClickZoom={false} // Disable double click zoom so we can double click to add pins
        style={{ width: '100%', height: '100%' }}
      >
        {/* Sleek Dark Matter or Positron Maps Tiles from CartoDB */}
        <TileLayer
          url={isLightMode 
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />

        {/* User Geolocation Pulse Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="dark-popup">
              <div style={{ textAlign: 'center', fontWeight: 600 }}>Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Job Pins wrapped in MarkerClusterGroup */}
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom={true}
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={45}
        >
          {jobs.map((job) => {
            const isActive = selectedJob && selectedJob.id === job.id;
            return (
              <Marker
                key={job.id}
                position={[job.coordinates.lat, job.coordinates.lng]}
                icon={createJobIcon(job.logo, isActive, job.isLiveEvent)}
                eventHandlers={{
                  click: () => {
                    onSelectJob(job);
                  }
                }}
              >
                <Popup className="dark-popup">
                  <div style={{ padding: '2px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
                      {job.title}
                    </h4>
                    <p style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                      {job.company}
                    </p>
                    <div style={{ display: 'flex', gap: '5px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>{job.salary}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>

        {/* Map Controller for movement and clicks */}
        <MapController
          onBoundsChange={onBoundsChange}
          onMapDoubleClick={onMapDoubleClick}
          centerTo={centerTo}
        />
      </MapContainer>
    </div>
  );
}
