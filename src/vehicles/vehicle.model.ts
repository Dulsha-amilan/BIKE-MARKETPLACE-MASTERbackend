export type VehicleSource = 'seed' | 'user';

export type Vehicle = {
  id: string;
  source: VehicleSource;
  type?: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number | null;
  registerYear?: number | null;
  price?: number | null;
  mileageKm?: number | null;
  engineCc?: number | null;
  engineCapacityCc?: number | null;
  transmission?: string;
  fuelType?: string;
  color?: string;
  condition?: string;
  location?: string;
  postedAt?: string;
  phone?: string;
  image?: string;
  gallery?: string[];
  categories?: string[];
  tags?: string[];
  [key: string]: any;
};
