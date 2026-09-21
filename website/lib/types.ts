// TypeScript types for pawenn.com

export type AnimalType = 'dog' | 'cat' | 'dog;cat';

export type ServiceCategory = 'salon' | 'vet' | 'hotel' | 'training' | 'sitting' | 'shop';

export type District =
  | 'stare-mesto'
  | 'ruzinov'
  | 'petrzalka'
  | 'karlova-ves'
  | 'nove-mesto'
  | 'dubravka'
  | 'raca'
  | 'vajnory'
  | 'devinska-nova-ves'
  | 'lamac'
  | 'podunajske-biskupice'
  | 'vrakuna'
  | 'devín'
  | 'cunovo'
  | 'jarovce'
  | 'rusovce'
  | 'zahorska-bystrica';

export interface BaseBusiness {
  name: string;
  address: string;
  district: District | '';
  phone: string;
  email: string;
  website: string;
  source_url: string;
  observed_at: string; // ISO date
  notes: string;
}

export interface Salon extends BaseBusiness {
  category: 'salon';
  animals: AnimalType;
}

export interface VetClinic extends BaseBusiness {
  category: 'vet';
}

export interface PetHotel extends BaseBusiness {
  category: 'hotel';
  animals: AnimalType;
}

export interface OtherService extends BaseBusiness {
  category: 'training' | 'sitting' | 'shop';
  animals: AnimalType;
}

export type Business = Salon | VetClinic | PetHotel | OtherService;

export interface SearchFilters {
  animal?: 'dog' | 'cat' | 'all';
  service?: ServiceCategory;
  district?: District | 'all';
}
