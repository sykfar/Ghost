import React, {useEffect, useRef} from 'react';
import {Waypoint} from '@app-types/trip';
import type {LineString, Feature} from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

interface TripMapProps {
    waypoints: Waypoint[];
    routeGeometry?: LineString | null;
    onMapClick: (lat: number, lng: number) => void;
}

const TripMap: React.FC<TripMapProps> = ({waypoints, routeGeometry, onMapClick}) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.LayerGroup>(L.layerGroup());
    const routeLayerRef = useRef<L.GeoJSON | null>(null);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current, {
            center: [48.2082, 16.3738], // Vienna default
            zoom: 13
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        markersRef.current.addTo(map);

        map.on('click', (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update click handler when callback changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }
        map.off('click');
        map.on('click', (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        });
    }, [onMapClick]);

    // Update markers when waypoints change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        markersRef.current.clearLayers();

        waypoints.forEach((wp, index) => {
            const lat = parseFloat(wp.latitude);
            const lng = parseFloat(wp.longitude);
            if (isNaN(lat) || isNaN(lng)) {
                return;
            }

            const marker = L.marker([lat, lng]);
            marker.bindPopup(`<b>${index + 1}. ${wp.name}</b>${wp.address ? `<br/>${wp.address}` : ''}${wp.duration_minutes ? `<br/>${wp.duration_minutes} min` : ''}`);
            markersRef.current.addLayer(marker);
        });

        // Fit bounds to markers
        if (waypoints.length > 0) {
            const validCoords = waypoints
                .map(wp => [parseFloat(wp.latitude), parseFloat(wp.longitude)] as [number, number])
                .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

            if (validCoords.length > 0) {
                const bounds = L.latLngBounds(validCoords.map(([lat, lng]) => L.latLng(lat, lng)));
                map.fitBounds(bounds, {padding: [50, 50], maxZoom: 15});
            }
        }
    }, [waypoints]);

    // Update route polyline
    useEffect(() => {
        const map = mapRef.current;
        if (!map) {
            return;
        }

        if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
        }

        if (routeGeometry) {
            routeLayerRef.current = L.geoJSON({
                type: 'Feature',
                properties: {},
                geometry: routeGeometry
            } as Feature, {
                style: {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.7
                }
            }).addTo(map);
        }
    }, [routeGeometry]);

    return (
        <div
            ref={containerRef}
            className="trip-map-container"
            style={{width: '100%', height: '100%', minHeight: '400px'}}
        />
    );
};

export default TripMap;
