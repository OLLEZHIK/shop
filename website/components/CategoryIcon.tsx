import type { BusinessCategory } from "@prisma/client";
import {
  ScissorsIcon,
  StethoscopeIcon,
  HotelIcon,
  WhistleIcon,
  ShopBagIcon,
  HeartHandIcon,
} from "./icons";

const ICONS: Record<BusinessCategory, (props: { className?: string }) => React.ReactElement> = {
  GROOMING: ScissorsIcon,
  VET_CLINIC: StethoscopeIcon,
  PET_HOTEL: HotelIcon,
  DOG_TRAINING: WhistleIcon,
  PET_SHOP: ShopBagIcon,
  PET_SITTING: HeartHandIcon,
};

export function CategoryIcon({ category, className }: { category: BusinessCategory; className?: string }) {
  const Icon = ICONS[category];
  return <Icon className={className} />;
}
