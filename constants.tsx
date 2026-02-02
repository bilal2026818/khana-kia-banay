
import React from 'react';

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const CATEGORIES: { label: string; icon: string }[] = [
  { label: 'Dinner', icon: '🍛' }
];

export const INITIAL_DISHES = [
  { id: '1', name: 'Biryani', category: 'Dinner' as const, tags: ['Spicy', 'Pakistani'], imageUrl: 'https://picsum.photos/seed/biryani/400/300' },
  { id: '2', name: 'Chicken Karahi', category: 'Dinner' as const, tags: ['Spicy', 'Meat'], imageUrl: 'https://picsum.photos/seed/karahi/400/300' },
  { id: '3', name: 'Daal Chawal', category: 'Dinner' as const, tags: ['Comfort', 'Veg'], imageUrl: 'https://picsum.photos/seed/daal/400/300' },
  { id: '4', name: 'Chapli Kabab', category: 'Dinner' as const, tags: ['Meat', 'Fried'], imageUrl: 'https://picsum.photos/seed/kabab/400/300' },
];
