import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Hospital } from '@/types/hospital';
import styles from './HospitalMap.module.scss';
import 'leaflet/dist/leaflet.css';

// Иконка для маркеров больниц
const hospitalIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface HospitalMapProps {
  hospitals: Hospital[];
  userLocation?: [number, number];
  onSelectHospital?: (hospital: Hospital) => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({ 
  hospitals, 
  userLocation, 
  onSelectHospital 
}) => {
  // Центр карты - пользователь или центр Киева
  const mapCenter = userLocation || [50.4501, 30.5234];

  // Фильтрация больниц (показываем все для демонстрации)
  const filteredHospitals = useMemo(() => {
    return hospitals;
  }, [hospitals]);

  return (
    <div className={styles.hospitalMap}>
      <div className={styles.mapHeader}>
        <h3>🏥 Медичні заклади поруч</h3>
        <p>Знайдено {filteredHospitals.length} закладів</p>
      </div>
      
      <div className={styles.mapContainer}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Маркеры больниц */}
          {filteredHospitals.map((hospital: Hospital) => (
            <Marker
              key={hospital.id}
              position={hospital.coordinates}
              icon={hospitalIcon}
              eventHandlers={{
                click: () => onSelectHospital?.(hospital)
              }}
            >
              <Popup>
                <div className={styles.popupContent}>
                  <h4>{hospital.name}</h4>
                  <p><strong>Тип:</strong> {hospital.type}</p>
                  <p><strong>Адреса:</strong> {hospital.address}</p>
                  <p><strong>Телефон:</strong> {hospital.phone}</p>
                  <p><strong>Рейтинг:</strong> {'⭐'.repeat(Math.round(hospital.rating))} ({hospital.rating})</p>
                  <p><strong>Доступні скринінги:</strong> {hospital.availableScreenings.length}</p>
                  {hospital.distance && (
                    <p><strong>Відстань:</strong> {hospital.distance.toFixed(1)} км</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Маркер пользователя */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <div className={styles.popupContent}>
                  <h4>📍 Ваше місцезнаходження</h4>
                  <p>Тут ви знаходитесь зараз</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}; 