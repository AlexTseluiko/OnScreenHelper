import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { useToast } from '@/hooks/useToast';
// @ts-ignore
import styles from './GoogleMedicalMap.module.scss';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface MedicalPlace {
  place_id: string;
  name: string;
  types: string[];
  vicinity: string;
  rating?: number;
  price_level?: number;
  geometry: {
    location: google.maps.LatLng;
  };
  photos?: google.maps.places.PlacePhoto[];
  opening_hours?: {
    open_now: boolean;
  };
  icon?: string;
  phone_number?: string;
  website?: string;
}

interface GoogleMedicalMapProps {
  className?: string;
  height?: string;
  userLocation?: GeolocationPosition | null;
  hasLocationPermission?: boolean;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBOy6uPJSI-pFCbjTJUqAUsb2eKJBi_sAw';

// Типи медичних закладів для пошуку (оновлено для нового API)
const MEDICAL_TYPES = [
  'hospital',
  'pharmacy', 
  'doctor',
  'dentist',
  'physiotherapist',
  'veterinary_care',
  'dental_clinic',
  'medical_lab'
];

// Додаткові медичні типи для фільтрації результатів (оновлено для нового API)
const VALID_MEDICAL_TYPES = [
  'hospital', 'pharmacy', 'doctor', 'dentist', 'physiotherapist', 
  'veterinary_care', 'dental_clinic', 'medical_lab', 'clinic', 
  'drugstore', 'spa', 'wellness_center', 'yoga_studio', 'massage',
  'chiropractor', 'skin_care_clinic', 'tanning_studio', 'sauna'
];

const MapComponent: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  onPlacesFound: (places: MedicalPlace[]) => void;
}> = ({ center, zoom, onPlacesFound }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow>();
  const { success: showToast } = useToast();

  // Ініціалізація карти
  useEffect(() => {
    if (ref.current && !map) {
      const mapInstance = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }] // Приховуємо всі стандартні POI
          },
          {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }] // Приховуємо медичні POI
          }
        ]
      });
      
      setMap(mapInstance);
      
      // Створюємо InfoWindow
      infoWindowRef.current = new google.maps.InfoWindow();
    }
  }, [ref, map, center, zoom]);

  // Геолокація користувача
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setUserLocation(userPos);
          
          if (map) {
            map.setCenter(userPos);
            map.setZoom(14);
            
            // Маркер поточного місцезнаходження (fallback для совместимости)
            try {
              // Пробуем использовать новый API
              const userMarkerEl = document.createElement('div');
              userMarkerEl.innerHTML = `
                <div style="
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  background: #4285f4;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  position: relative;
                ">
                  <div style="
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: white;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                  "></div>
                </div>
              `;
              
              // @ts-ignore - Используем новый API если доступен
              if (window.google.maps.marker?.AdvancedMarkerElement) {
                // @ts-ignore
                new window.google.maps.marker.AdvancedMarkerElement({
                  position: userPos,
                  map: map,
                  title: 'Ваше місцезнаходження',
                  content: userMarkerEl
                });
              } else {
                // Fallback к старому API
                new google.maps.Marker({
                  position: userPos,
                  map: map,
                  title: 'Ваше місцезнаходження',
                  icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="#4285f4" stroke="#ffffff" stroke-width="3"/>
                        <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 12)
                  }
                });
              }
            } catch (error) {
              console.error('Error creating user location marker:', error);
            }
            
            showToast('Ваше місцезнаходження знайдено!');
          }
        },
        (error) => {
          showToast('Не вдалося отримати геолокацію');
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      showToast('Геолокація не підтримується вашим браузером');
    }
  }, [map, showToast]);

  // Очищення маркерів
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      try {
        if (marker.setMap) {
          marker.setMap(null); // Старый API
        } else if (marker.map) {
          marker.map = null; // Новый API
        }
      } catch (error) {
        console.error('Error clearing marker:', error);
      }
    });
    markersRef.current = [];
  };

  // Пошук медичних закладів з fallback для совместимости
  const searchMedicalPlaces = useCallback(async (searchCenter?: google.maps.LatLngLiteral) => {
    if (!map) return;

    const searchLocation = searchCenter || userLocation || center;
    
    clearMarkers();
    const allPlaces: MedicalPlace[] = [];

    // Визначаємо які типи шукати
    const typesToSearch = selectedType === 'all' ? 
      MEDICAL_TYPES : 
      selectedType === 'medical_lab' ? ['medical_lab'] : [selectedType];

    try {
      // Пробуем использовать новый Places API
      // @ts-ignore
      if (window.google.maps.importLibrary) {
        try {
          // @ts-ignore
          const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary("places");
          
          for (const type of typesToSearch) {
            try {
              const requestConfig: any = {
                fields: ['displayName', 'location', 'types', 'formattedAddress', 'rating', 'priceLevel', 'photos', 'regularOpeningHours', 'id'],
                locationRestriction: {
                  center: searchLocation,
                  radius: 5000,
                },
                maxResultCount: 20,
                rankPreference: SearchNearbyRankPreference.POPULARITY,
                includedTypes: [type]
              };

              const { places } = await Place.searchNearby(requestConfig);
              
              if (places && places.length > 0) {
                places.forEach((place: any) => {
                  if (place.location) {
                    const shouldAdd = place.types?.some((placeType: string) => 
                      VALID_MEDICAL_TYPES.includes(placeType)
                    ) || type === 'medical_lab';
                    
                    if (shouldAdd) {
                      const convertedPlace: MedicalPlace = {
                        place_id: place.id || '',
                        name: place.displayName || 'Невідома назва',
                        types: place.types || [],
                        vicinity: place.formattedAddress || '',
                        rating: place.rating,
                        price_level: place.priceLevel,
                        geometry: {
                          location: place.location
                        },
                        photos: place.photos,
                        opening_hours: place.regularOpeningHours ? {
                          open_now: place.regularOpeningHours.openNow || false
                        } : undefined
                      };
                      
                      allPlaces.push(convertedPlace);
                      
                      // Створюємо маркер
                      const marker = createMarker(place.location, place.displayName || 'Медичний заклад', type, convertedPlace);
                      if (marker) {
                        markersRef.current.push(marker);
                      }
                    }
                  }
                });
              }
            } catch (error) {
              console.error(`Error searching for ${type}:`, error);
            }
          }
        } catch (newApiError) {
          console.warn('New Places API not available, falling back to old API:', newApiError);
          // Fallback к старому API
          await searchWithOldAPI(typesToSearch, searchLocation, allPlaces);
        }
      } else {
        // Fallback к старому API
        await searchWithOldAPI(typesToSearch, searchLocation, allPlaces);
      }

      onPlacesFound(allPlaces);
      showToast(`Знайдено ${allPlaces.length} медичних закладів`);
    } catch (error) {
      console.error('Places API error:', error);
      showToast('Помилка при пошуку медичних закладів');
    }
  }, [map, userLocation, center, selectedType, onPlacesFound, showToast]);

  // Fallback функция для старого API
  const searchWithOldAPI = async (typesToSearch: string[], searchLocation: google.maps.LatLngLiteral, allPlaces: MedicalPlace[]) => {
    const service = new google.maps.places.PlacesService(map!);
    
    const searchPromises = typesToSearch.map(type => {
      return new Promise<void>((resolve) => {
        const request: any = {
          location: searchLocation,
          radius: 5000,
          type: type === 'medical_lab' ? 'establishment' : type,
        };

        // Для лабораторій додаємо keyword
        if (type === 'medical_lab') {
          request.keyword = 'laboratory lab діагностика аналізи медична лабораторія';
        }

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach(place => {
              if (place.geometry?.location) {
                let shouldAdd = false;
                
                if (type === 'medical_lab') {
                  shouldAdd = place.name?.toLowerCase().includes('лабораторія') ||
                             place.name?.toLowerCase().includes('діагност') ||
                             place.name?.toLowerCase().includes('аналіз') ||
                             place.name?.toLowerCase().includes('laboratory') ||
                             place.name?.toLowerCase().includes('lab');
                } else {
                  shouldAdd = place.types?.some((placeType: string) => 
                    VALID_MEDICAL_TYPES.includes(placeType)
                  );
                }
                
                if (shouldAdd) {
                  allPlaces.push(place as MedicalPlace);
                  
                  const marker = createMarker(
                    place.geometry.location,
                    place.name || 'Медичний заклад',
                    type,
                    place as MedicalPlace
                  );
                  if (marker) {
                    markersRef.current.push(marker);
                  }
                }
              }
            });
          }
          resolve();
        });
      });
    });

    await Promise.all(searchPromises);
  };

  // Функція для створення маркера з fallback
  const createMarker = (position: any, title: string, type: string, place: MedicalPlace): any => {
    try {
      // @ts-ignore - Пробуем новый API
      if (window.google.maps.marker?.AdvancedMarkerElement) {
        const markerElement = createMarkerElement(type);
        // @ts-ignore
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: map,
          title: title,
          content: markerElement
        });

        marker.addListener('click', () => {
          showPlaceInfo(place, marker);
        });

        return marker;
      } else {
        // Fallback к старому API
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: title,
          icon: getMarkerIcon(type)
        });

        marker.addListener('click', () => {
          showPlaceInfo(place, marker);
        });

        return marker;
      }
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  };

  // Функція для створення HTML елемента маркера (новый API)
  const createMarkerElement = (type: string): HTMLElement => {
    const colors: { [key: string]: string } = {
      hospital: '#ef4444',
      pharmacy: '#10b981', 
      doctor: '#3b82f6',
      dentist: '#8b5cf6',
      physiotherapist: '#f59e0b',
      veterinary_care: '#06b6d4',
      health: '#ec4899',
      medical_lab: '#84cc16'
    };

    const markerEl = document.createElement('div');
    markerEl.style.cssText = `
      width: 32px;
      height: 40px;
      position: relative;
      cursor: pointer;
    `;
    
    const getSymbol = (type: string): string => {
      switch (type) {
        case 'hospital':
          return '<rect x="14" y="8" width="4" height="16" fill="white"/><rect x="8" y="12" width="16" height="4" fill="white"/>';
        case 'pharmacy':
          return '<rect x="14" y="8" width="4" height="16" fill="white"/><rect x="8" y="12" width="16" height="4" fill="white"/><circle cx="16" cy="16" r="2" fill="' + (colors[type] || '#6b7280') + '"/>';
        case 'doctor':
          return '<circle cx="16" cy="10" r="3" fill="white"/><ellipse cx="16" cy="18" rx="5" ry="6" fill="white"/>';
        case 'dentist':
          return '<ellipse cx="16" cy="14" rx="4" ry="6" fill="white"/><circle cx="14" cy="12" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="18" cy="12" r="1" fill="' + (colors[type] || '#6b7280') + '"/>';
        case 'medical_lab':
          return '<rect x="10" y="10" width="12" height="8" fill="white" rx="1"/><circle cx="13" cy="13" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="19" cy="13" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="16" cy="16" r="1" fill="' + (colors[type] || '#6b7280') + '"/>';
        default:
          return '<rect x="12" y="12" width="8" height="8" fill="white" rx="1"/>';
      }
    };

    markerEl.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.164 0 0 7.164 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.164 24.836 0 16 0z" fill="${colors[type] || '#6b7280'}"/>
        <circle cx="16" cy="16" r="10" fill="${colors[type] || '#6b7280'}"/>
        ${getSymbol(type)}
      </svg>
    `;

    return markerEl;
  };

  // Функція для отримання іконки маркера (старый API)
  const getMarkerIcon = (type: string): google.maps.Icon => {
    const colors: { [key: string]: string } = {
      hospital: '#ef4444',
      pharmacy: '#10b981', 
      doctor: '#3b82f6',
      dentist: '#8b5cf6',
      physiotherapist: '#f59e0b',
      veterinary_care: '#06b6d4',
      health: '#ec4899',
      medical_lab: '#84cc16'
    };

    const getSymbol = (type: string): string => {
      switch (type) {
        case 'hospital':
          return '<rect x="14" y="8" width="4" height="16" fill="white"/><rect x="8" y="12" width="16" height="4" fill="white"/>';
        case 'pharmacy':
          return '<rect x="14" y="8" width="4" height="16" fill="white"/><rect x="8" y="12" width="16" height="4" fill="white"/><circle cx="16" cy="16" r="2" fill="' + (colors[type] || '#6b7280') + '"/>';
        case 'doctor':
          return '<circle cx="16" cy="10" r="3" fill="white"/><ellipse cx="16" cy="18" rx="5" ry="6" fill="white"/>';
        case 'dentist':
          return '<ellipse cx="16" cy="14" rx="4" ry="6" fill="white"/><circle cx="14" cy="12" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="18" cy="12" r="1" fill="' + (colors[type] || '#6b7280') + '"/>';
        case 'medical_lab':
          return '<rect x="10" y="10" width="12" height="8" fill="white" rx="1"/><circle cx="13" cy="13" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="19" cy="13" r="1" fill="' + (colors[type] || '#6b7280') + '"/><circle cx="16" cy="16" r="1" fill="' + (colors[type] || '#6b7280') + '"/>';
        default:
          return '<rect x="12" y="12" width="8" height="8" fill="white" rx="1"/>';
      }
    };

    return {
      url: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
          <path d="M16 0C7.164 0 0 7.164 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.164 24.836 0 16 0z" fill="${colors[type] || '#6b7280'}"/>
          <circle cx="16" cy="16" r="10" fill="${colors[type] || '#6b7280'}"/>
          ${getSymbol(type)}
        </svg>
      `),
      scaledSize: new google.maps.Size(32, 40),
      anchor: new google.maps.Point(16, 40)
    };
  };

  // Показ інформації про заклад
  const showPlaceInfo = (place: MedicalPlace, marker: any) => {
    if (!infoWindowRef.current || !map) return;

    const content = `
      <div class="${styles.infoWindow}">
        <h3>${place.name}</h3>
        <p><strong>Адреса:</strong> ${place.vicinity}</p>
        ${place.rating ? `<p><strong>Рейтинг:</strong> ${'⭐'.repeat(Math.floor(place.rating))} (${place.rating})</p>` : ''}
        ${place.opening_hours?.open_now !== undefined ? 
          `<p><strong>Статус:</strong> ${place.opening_hours.open_now ? '🟢 Відкрито' : '🔴 Закрито'}</p>` : ''}
        <p><strong>Тип:</strong> ${place.types.filter(t => VALID_MEDICAL_TYPES.includes(t)).join(', ')}</p>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    
    // Используем стандартную сигнатуру метода open
    try {
      // @ts-ignore - Игнорируем типы для совместимости
      infoWindowRef.current.open(map, marker);
    } catch (error) {
      console.error('Error opening info window:', error);
    }
  };

  // Автоматичний пошук при зміні карти або типу
  useEffect(() => {
    if (map) {
      searchMedicalPlaces();
    }
  }, [map, userLocation, selectedType]);

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapControls}>
        <button 
          onClick={getUserLocation}
          className={styles.locationButton}
          title="Знайти моє місцезнаходження"
        >
          📍 Моя геолокація
        </button>
        
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={styles.typeSelect}
          title="Оберіть тип медичного закладу"
        >
          <option value="all">Усі типи</option>
          <option value="hospital">🏥 Лікарні</option>
          <option value="pharmacy">💊 Аптеки</option>
          <option value="doctor">👨‍⚕️ Лікарі</option>
          <option value="dentist">🦷 Стоматологи</option>
          <option value="dental_clinic">🦷 Стоматологічні клініки</option>
          <option value="physiotherapist">🏃‍♂️ Фізіотерапевти</option>
          <option value="veterinary_care">🐕 Ветклініки</option>
          <option value="medical_lab">🧪 Лабораторії</option>
        </select>
        
        <button 
          onClick={() => searchMedicalPlaces()}
          className={styles.searchButton}
          title="Пошук медичних закладів"
        >
          🔍 Знайти заклади
        </button>
      </div>
      <div ref={ref} className={styles.map} />
    </div>
  );
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Завантаження Google Maps...</p>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className={styles.error}>
          <p>❌ Помилка завантаження Google Maps</p>
        </div>
      );
    case Status.SUCCESS:
      return <MapComponent center={{ lat: 50.4501, lng: 30.5234 }} zoom={10} onPlacesFound={() => {}} />;
  }
};

export const GoogleMedicalMap: React.FC<GoogleMedicalMapProps> = ({ 
  className = '', 
  height = '500px'
}) => {
  const [foundPlaces, setFoundPlaces] = useState<MedicalPlace[]>([]);

  return (
    <div className={`${styles.container} ${className}`} style={{ height }}>
      <div className={styles.header}>
        <h2 className={styles.title}>🗺️ Медичні заклади поруч</h2>
        <div className={styles.stats}>
          Знайдено: {foundPlaces.length} закладів
        </div>
      </div>
      
      <Wrapper 
        apiKey={GOOGLE_MAPS_API_KEY}
        render={render}
        libraries={['places']}
      >
        <MapComponent 
          center={{ lat: 50.4501, lng: 30.5234 }} 
          zoom={10} 
          onPlacesFound={setFoundPlaces}
        />
      </Wrapper>

      <div className={styles.legend}>
        <h4>Легенда:</h4>
        <div className={styles.legendItems}>
          <span className={styles.legendItem}>🏥 Лікарні</span>
          <span className={styles.legendItem}>💊 Аптеки</span>
          <span className={styles.legendItem}>👨‍⚕️ Лікарі</span>
          <span className={styles.legendItem}>🦷 Стоматологи</span>
          <span className={styles.legendItem}>🦷 Стоматологічні клініки</span>
          <span className={styles.legendItem}>🏃‍♂️ Фізіотерапевти</span>
          <span className={styles.legendItem}>🐕 Ветклініки</span>
          <span className={styles.legendItem}>🧪 Лабораторії</span>
        </div>
      </div>
    </div>
  );
}; 