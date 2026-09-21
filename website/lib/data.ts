import fs from 'fs';
import path from 'path';
import type { AnimalType, Business, Salon, VetClinic, PetHotel, OtherService, SearchFilters } from './types';

// CSV parsing helper
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
}

// Load all data from CSV files
function loadData(): Business[] {
  const dataDir = path.join(process.cwd(), 'data');
  const businesses: Business[] = [];

  // Load salons
  const salonsCSV = fs.readFileSync(path.join(dataDir, 'salons-bratislava.csv'), 'utf-8');
  const salonsData = parseCSV(salonsCSV);
  salonsData.forEach(row => {
    businesses.push({
      ...row,
      category: 'salon',
      animals: row.animals as AnimalType,
    } as Salon);
  });

  // Load vet clinics
  const vetsCSV = fs.readFileSync(path.join(dataDir, 'vet-clinics-bratislava.csv'), 'utf-8');
  const vetsData = parseCSV(vetsCSV);
  vetsData.forEach(row => {
    businesses.push({
      ...row,
      category: 'vet',
    } as VetClinic);
  });

  // Load pet hotels
  const hotelsCSV = fs.readFileSync(path.join(dataDir, 'pet-hotels-bratislava.csv'), 'utf-8');
  const hotelsData = parseCSV(hotelsCSV);
  hotelsData.forEach(row => {
    businesses.push({
      ...row,
      category: 'hotel',
      animals: row.animals as AnimalType,
    } as PetHotel);
  });

  // Load other services
  const othersCSV = fs.readFileSync(path.join(dataDir, 'other-pet-services-bratislava.csv'), 'utf-8');
  const othersData = parseCSV(othersCSV);
  othersData.forEach(row => {
    businesses.push({
      ...row,
      category: row.category as OtherService['category'],
      animals: row.animals as AnimalType,
    } as OtherService);
  });

  return businesses;
}

// Cache data
let cachedData: Business[] | null = null;

export function getAllBusinesses(): Business[] {
  if (!cachedData) {
    cachedData = loadData();
  }
  return cachedData;
}

export function getBusinessById(id: string): Business | undefined {
  const all = getAllBusinesses();
  return all.find((b, i) => `${b.category}-${i}` === id);
}

export function searchBusinesses(filters: SearchFilters): Business[] {
  const all = getAllBusinesses();
  
  return all.filter(business => {
    // Filter by animal type
    if (filters.animal && filters.animal !== 'all') {
      if ('animals' in business) {
        const animals = business.animals.split(';');
        if (!animals.includes(filters.animal)) return false;
      }
    }

    // Filter by service category
    if (filters.service && business.category !== filters.service) {
      return false;
    }

    // Filter by district
    if (filters.district && filters.district !== 'all' && business.district !== filters.district) {
      return false;
    }

    return true;
  });
}

export function getBusinessCount(): { total: number; byCategory: Record<string, number> } {
  const all = getAllBusinesses();
  const byCategory: Record<string, number> = {};
  
  all.forEach(b => {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
  });

  return { total: all.length, byCategory };
}
