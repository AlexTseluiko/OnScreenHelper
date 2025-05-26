export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
  website?: string;
  type: 'лікарня' | 'поліклініка' | 'приватна клініка' | 'діагностичний центр';
  availableScreenings: string[]; // массив ID скринингов
  rating: number; // 1-5
  reviewsCount: number;
  openingHours: {
    [key: string]: string; // day: hours (e.g., "пн": "08:00-18:00")
  };
  distance?: number; // расстояние от пользователя в км
} 