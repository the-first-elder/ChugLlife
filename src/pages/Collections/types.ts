export interface ChogTrait {
  traitType: string;
  value: string;
}

export interface ChogCollectionItem {
  tokenId: string;
  name: string;
  image: string;
  description: string;
  traits: ChogTrait[];
}

export interface ProfileCardProps {
  address?: string;
  chogs: ChogCollectionItem[] | null;
  error?: string;
}

export interface CollectionGridProps {
  chogs: ChogCollectionItem[] | null;
  loading: boolean;
  error?: string;
}

export interface StatItemProps {
  label: string;
  value: string | number;
}
