import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

// ─── Custom Marker Icons ────────────────────────────────────────────────────

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

const itineraryIcon = (index) => L.divIcon({
  html: `<div class="itinerary-marker">${index}</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const userIcon = L.divIcon({
  html: '<div class="user-location-marker" title="You are here"></div>',
  className: 'user-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createClusterCustomIcon = (cluster) =>
  L.divIcon({
    html: `<div class="cluster-marker"><span>${cluster.getChildCount()}</span></div>`,
    className: 'custom-leaflet-cluster',
    iconSize: L.point(40, 40, true),
  });

// ─── Heatmap Layer (vanilla leaflet.heat) ───────────────────────────────────

function HeatmapLayer({ jobs }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!window.L || !window.L.heatLayer) return;

    const points = jobs
      .filter(j => j.type === 'Remote' || j.type === 'Contract' || j.type === 'Freelance')
      .map(j => [j.coordinates.lat, j.coordinates.lng, 0.9]);

    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    heatRef.current = window.L.heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 10,
      gradient: { 0.2: '#00d4ff', 0.5: '#7c3aed', 0.8: '#f59e0b', 1.0: '#ef4444' }
    }).addTo(map);

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    };
  }, [map, jobs]);

  return null;
}

// ─── Map Controller ─────────────────────────────────────────────────────────

function MapController({ onBoundsChange, onMapDoubleClick, centerTo }) {
  const map = useMap();

  useEffect(() => {
    if (centerTo) {
      map.setView([centerTo.lat, centerTo.lng], centerTo.zoom || 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [centerTo, map]);

  useEffect(() => {
    const reportBounds = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
        northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng }
      });
    };
    const timer = setTimeout(reportBounds, 100);
    return () => clearTimeout(timer);
  }, [map, onBoundsChange]);

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
      onMapDoubleClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return null;
}

// ─── Main JobMap Component ───────────────────────────────────────────────────

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
  isLightMode,
  isNomadMode,
  isCommuteMode,
  commuteRadiusKm,
  itineraryJobs,
}) {
  const defaultCenter = [20, 0];
  const defaultZoom = 2.5;

  // Prompt user for geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          setCenterTo({ lat: coords.lat, lng: coords.lng, zoom: 11 });
        },
        () => {
          setCenterTo({ lat: 17.44829, lng: 78.39148, zoom: 12 });
        }
      );
    } else {
      setCenterTo({ lat: 17.44829, lng: 78.39148, zoom: 12 });
    }
  }, [setUserLocation, setCenterTo]);

  // Build itinerary polyline positions: userLocation -> each stop in order
  const routePositions = itineraryJobs && itineraryJobs.length > 0
    ? [
        userLocation ? [userLocation.lat, userLocation.lng] : [17.44829, 78.39148],
        ...itineraryJobs.map(j => [j.coordinates.lat, j.coordinates.lng])
      ]
    : [];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={true}
        doubleClickZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Map tile layer */}
        <TileLayer
          url={isLightMode
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={20}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="dark-popup">
              <div style={{ textAlign: 'center', fontWeight: 600 }}>📍 Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* ── Commute Radius Circle ── */}
        {isCommuteMode && userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={commuteRadiusKm * 1000}
            pathOptions={{
              color: '#7c3aed',
              fillColor: '#7c3aed',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '8 4'
            }}
          />
        )}

        {/* ── Nomad Heatmap (leaflet.heat loaded via script tag) ── */}
        {isNomadMode && <HeatmapLayer jobs={jobs} />}

        {/* ── Job Pins (hidden in nomad mode to show pure heatmap) ── */}
        {!isNomadMode && (
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
                  eventHandlers={{ click: () => onSelectJob(job) }}
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
                        <span>{job.salary}</span><span>•</span><span>{job.type}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}

        {/* ── Itinerary Route Polyline ── */}
        {routePositions.length > 1 && (
          <>
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#f59e0b',
                weight: 3,
                opacity: 0.85,
                dashArray: '10 5'
              }}
            />
            {/* Numbered stop markers */}
            {itineraryJobs.map((job, i) => (
              <Marker
                key={`itin-${job.id}`}
                position={[job.coordinates.lat, job.coordinates.lng]}
                icon={itineraryIcon(i + 1)}
              >
                <Popup className="dark-popup">
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Stop {i + 1}: {job.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{job.company}</div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        <MapController
          onBoundsChange={onBoundsChange}
          onMapDoubleClick={onMapDoubleClick}
          centerTo={centerTo}
        />
      </MapContainer>
    </div>
  );
}
