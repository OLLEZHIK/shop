import { BirdIcon, CatIcon, DogIcon, FishIcon, PawIcon, RabbitIcon } from "./icons";

const ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  dog: DogIcon,
  cat: CatIcon,
  "small-pet": RabbitIcon,
  bird: BirdIcon,
  fish: FishIcon,
};

export function AnimalIcon({ animal, className }: { animal: string; className?: string }) {
  const Icon = ICONS[animal] ?? PawIcon;
  return <Icon className={className} />;
}
