export interface SubCategoryItem {
  name: string;
  href: string;
  isHot?: boolean;
  isNew?: boolean;
}

export interface SubCategoryColumn {
  title: string;
  items: SubCategoryItem[];
}

export interface PromoCardData {
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaHref: string;
  tagline?: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  href: string;
  hasMegaMenu?: boolean;
  badge?: {
    text: string;
    variant: 'gold' | 'purple' | 'sale';
  };
  columns?: SubCategoryColumn[];
  promoCard?: PromoCardData;
}

export interface VisualCategoryItem {
  id: string;
  name: string;
  href: string;
  iconName: string;
  badge?: string;
  highlight?: boolean;
}

export interface SearchCategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface TopPromoItem {
  id: string;
  text: string;
  highlightText?: string;
  linkText?: string;
  linkHref?: string;
}
