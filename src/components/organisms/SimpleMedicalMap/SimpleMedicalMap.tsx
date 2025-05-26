import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useToast } from '@/hooks/useToast';
import styles from './SimpleMedicalMap.module.scss';
import 'leaflet/dist/leaflet.css';

// Фикс для іконок Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MedicalPlace {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  coordinates: [number, number];
  rating?: number;
  isOpen?: boolean;
  website?: string;
}

interface SimpleMedicalMapProps {
  className?: string;
  height?: string;
}

// Симуляція медичних закладів (в реальному додатку - з API)
const mockMedicalPlaces: MedicalPlace[] = [
  {
    id: '1',
    name: 'Лікарня №1',
    type: 'hospital',
    address: 'вул. Хрещатик, 1, Київ',
    phone: '+380441234567',
    coordinates: [50.4501, 30.5234],
    rating: 4.5,
    isOpen: true,
    website: 'https://hospital1.ua'
  },
  {
    id: '2', 
    name: 'Аптека "Здоров\'я"',
    type: 'pharmacy',
    address: 'пр. Перемоги, 15, Київ',
    phone: '+380442345678',
    coordinates: [50.4421, 30.5186],
    rating: 4.2,
    isOpen: true
  },
  {
    id: '3',
    name: 'Стоматологічна клініка "Смайл"',
    type: 'dentist',
    address: 'вул. Володимирська, 22, Київ',
    phone: '+380443456789',
    coordinates: [50.4547, 30.5238],
    rating: 4.8,
    isOpen: false
  },
  {
    id: '4',
    name: 'Медичний центр "Життя"',
    type: 'doctor',
    address: 'бул. Лесі Українки, 30, Київ',
    phone: '+380444567890',
    coordinates: [50.4265, 30.5383],
    rating: 4.6,
    isOpen: true
  },
  {
    id: '5',
    name: 'Аптека 24/7',
    type: 'pharmacy',
    address: 'вул. Саксаганського, 12, Київ',
    phone: '+380445678901',
    coordinates: [50.4431, 30.5216],
    rating: 4.1,
    isOpen: true
  },
  {
    id: '6',
    name: 'Лікарня імені Богомольця',
    type: 'hospital',
    address: 'бул. Шевченка, 13, Київ',
    phone: '+380441111111',
    coordinates: [50.4444, 30.5055],
    rating: 4.7,
    isOpen: true
  },
  {
    id: '7',
    name: 'Стоматологія "Дентал плюс"',
    type: 'dentist',
    address: 'вул. Льва Толстого, 5, Київ',
    phone: '+380442222222',
    coordinates: [50.4365, 30.5177],
    rating: 4.3,
    isOpen: true
  },
  {
    id: '8',
    name: 'Сімейний лікар',
    type: 'doctor',
    address: 'пр. Науки, 45, Київ',
    phone: '+380443333333',
    coordinates: [50.4150, 30.5267],
    rating: 4.4,
    isOpen: false
  }
];

const typeIcons: { [key: string]: string } = {
  hospital: '🏥',
  pharmacy: '💊',
  doctor: '👨‍⚕️',
  dentist: '🦷',
  physiotherapist: '🏃‍♂️',
  veterinary_care: '🐕',
  health: '❤️',
  medical_lab: '🧪'
};

const typeColors: { [key: string]: string } = {
  hospital: '#ef4444',
  pharmacy: '#10b981',
  doctor: '#3b82f6',
  dentist: '#8b5cf6',
  physiotherapist: '#f59e0b',
  veterinary_care: '#06b6d4',
  health: '#ec4899',
  medical_lab: '#84cc16'
};

export const SimpleMedicalMap: React.FC<SimpleMedicalMapProps> = ({
  className = '',
  height = '500px'
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [filteredPlaces, setFilteredPlaces] = useState<MedicalPlace[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5км
  const { success, error } = useToast();

  // Функція для отримання геолокації
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(userPos);
          success('Ваше місцезнаходження знайдено!');
        },
        (errorDetails) => {
          error('Не вдалося отримати геолокацію');
          console.error('Geolocation error:', errorDetails);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      error('Геолокація не підтримується вашим браузером');
    }
  }, [success, error]);

  // Фільтрація за типом
  const filterByType = useCallback(() => {
    let filtered = [...mockMedicalPlaces]; // Створюємо копію масиву
    
    // Фільтрація за типом
    if (selectedType !== 'all') {
      filtered = filtered.filter(place => place.type === selectedType);
    }

    // Фільтрація за радіусом, коли є геолокація
    if (userLocation && searchRadius > 0) {
      filtered = filtered.filter(place => {
        const distance = calculateDistance(
          userLocation[0], userLocation[1],
          place.coordinates[0], place.coordinates[1]
        );
        return distance <= searchRadius;
      });
    }

    setFilteredPlaces(filtered);
  }, [selectedType, userLocation, searchRadius]);

  // Простий розрахунок відстані (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Радіус Землі в метрах
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Створення кастомної іконки
  const createCustomIcon = (type: string): Icon => {
    const color = typeColors[type] || '#6b7280';
    
    // Используем простые SVG символы вместо эмоджи для совместимости с btoa
    const getTypeSymbol = (type: string): string => {
      switch (type) {
        case 'hospital':
          return '<rect x="6" y="8" width="20" height="12" fill="white" rx="2"/><rect x="14" y="4" width="4" height="20" fill="white"/><rect x="8" y="12" width="16" height="4" fill="white"/>';
        case 'pharmacy':
          return '<circle cx="16" cy="12" r="6" fill="white"/><rect x="14" y="8" width="4" height="8" fill="' + color + '"/><rect x="12" y="10" width="8" height="4" fill="' + color + '"/>';
        case 'doctor':
          return '<circle cx="16" cy="10" r="4" fill="white"/><path d="M10 18 Q16 14 22 18 L22 22 L10 22 Z" fill="white"/>';
        case 'dentist':
          return '<ellipse cx="16" cy="14" rx="6" ry="8" fill="white"/><circle cx="13" cy="12" r="1" fill="' + color + '"/><circle cx="19" cy="12" r="1" fill="' + color + '"/>';
        default:
          return '<rect x="12" y="12" width="8" height="8" fill="white" rx="1"/>';
      }
    };
    
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
          <path d="M16 0C7.164 0 0 7.164 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.164 24.836 0 16 0z" fill="${color}"/>
          <circle cx="16" cy="16" r="10" fill="white"/>
          ${getTypeSymbol(type)}
        </svg>
      `)}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });
  };

  // Ефект для фільтрації при зміні параметрів
  useEffect(() => {
    filterByType();
  }, [selectedType, userLocation, searchRadius]);

  // Початкова ініціалізація
  useEffect(() => {
    setFilteredPlaces(mockMedicalPlaces);
  }, []);

  // Центр карти - Київ або геолокація користувача
  const mapCenter: [number, number] = userLocation || [50.4501, 30.5234];

  return (
    <div className={`${styles.container} ${className}`} style={{ height }}>
      <div className={styles.header}>
        <h2 className={styles.title}>🗺️ Медичні заклади поруч</h2>
        <div className={styles.stats}>
          Знайдено: {filteredPlaces.length} закладів
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          onClick={getUserLocation}
          className={styles.locationButton}
        >
          📍 Моя геолокація
        </button>

        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={styles.typeSelect}
        >
          <option value="all">Усі типи</option>
          <option value="hospital">🏥 Лікарні</option>
          <option value="pharmacy">💊 Аптеки</option>
          <option value="doctor">👨‍⚕️ Лікарі</option>
          <option value="dentist">🦷 Стоматологи</option>
        </select>

        <select
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className={styles.radiusSelect}
        >
          <option value={1000}>1 км</option>
          <option value={2000}>2 км</option>
          <option value={5000}>5 км</option>
          <option value={10000}>10 км</option>
          <option value={0}>Без обмежень</option>
        </select>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Маркер користувача */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={defaultIcon}>
                <Popup>
                  <div className={styles.userPopup}>
                    <h4>📍 Ваше місцезнаходження</h4>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={searchRadius}
                color="#4285f4"
                fillColor="#4285f4"
                fillOpacity={0.1}
              />
            </>
          )}

          {/* Маркери медичних закладів */}
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={place.coordinates}
              icon={createCustomIcon(place.type)}
            >
              <Popup className={styles.popup}>
                <div className={styles.popupContent}>
                  <h4>{place.name}</h4>
                  
                  <div className={styles.placeInfo}>
                    <p><strong>📍 Адреса:</strong> {place.address}</p>
                    <p><strong>📞 Телефон:</strong> 
                      <a href={`tel:${place.phone}`} className={styles.phoneLink}>
                        {place.phone}
                      </a>
                    </p>
                    
                    {place.rating && (
                      <p><strong>⭐ Рейтинг:</strong> {place.rating}/5</p>
                    )}
                    
                    <p><strong>🕒 Статус:</strong> 
                      <span className={place.isOpen ? styles.openStatus : styles.closedStatus}>
                        {place.isOpen ? ' Відкрито' : ' Закрито'}
                      </span>
                    </p>
                    
                    {place.website && (
                      <p>
                        <a href={place.website} target="_blank" rel="noopener noreferrer" className={styles.websiteLink}>
                          🌐 Сайт закладу
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className={styles.legend}>
        <h4>Типи медичних закладів:</h4>
        <div className={styles.legendItems}>
          {Object.entries(typeIcons).map(([type, icon]) => (
            <div key={type} className={styles.legendItem}>
              <span>{icon}</span>
              <span className={styles.legendText}>
                {type === 'hospital' && 'Лікарні'}
                {type === 'pharmacy' && 'Аптеки'}
                {type === 'doctor' && 'Лікарі'}
                {type === 'dentist' && 'Стоматологи'}
                {type === 'physiotherapist' && 'Фізіотерапевти'}
                {type === 'veterinary_care' && 'Ветклініки'}
                {type === 'health' && 'Центри здоров\'я'}
                {type === 'medical_lab' && 'Лабораторії'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 