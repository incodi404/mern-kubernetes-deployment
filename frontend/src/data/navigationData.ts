import axios from 'axios';
import { SERVER_URL } from '../constant';
import {
  NavCategory,
  VisualCategoryItem,
  SearchCategoryOption,
  TopPromoItem,
} from '@/types/navigation';


export const TOP_PROMO_MESSAGES: TopPromoItem[] = [
  {
    id: '1',
    text: 'Free Express Shipping across India on orders above',
    highlightText: '₹999',
    linkText: 'Shop Now',
    linkHref: '/collections/offers',
  },
  {
    id: '2',
    text: 'Curated Gifts & Fine Stationery • Handwritten Cards Included with Every Order',
    highlightText: 'Special Touch',
    linkText: 'Explore',
    linkHref: '/collections/gifts',
  },
  {
    id: '3',
    text: 'Hassle-free 7-Day Returns & 100% Genuine Handpicked Quality',
    highlightText: 'Guaranteed',
  },
];

export const SEARCH_CATEGORY_OPTIONS: SearchCategoryOption[] = [
  { id: 'all', name: 'All Categories', slug: 'all' },
  { id: 'gifts', name: 'Gifts', slug: 'gifts' },
  { id: 'stationery', name: 'Stationery', slug: 'stationery' },
  { id: 'writing', name: 'Writing', slug: 'writing' },
  { id: 'art-craft', name: 'Art & Craft', slug: 'art-craft' },
  { id: 'office', name: 'Office Supplies', slug: 'office-supplies' },
  { id: 'personalized', name: 'Personalized', slug: 'personalized-gifts' },
  { id: 'hampers', name: 'Gift Hampers', slug: 'gift-hampers' },
];

export const search_options = async (): Promise<any> => {
  try {
    const response = await axios.get(`${SERVER_URL}/category/1/10`);
    
    // Axios automatically puts the parsed JSON body into response.data
    return response.data; 
  } catch (error: any) {
    // Axios catches non-2xx status codes and network failures here automatically
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const TRENDING_SEARCH_KEYWORDS = [
  'Leather Journal',
  'Fountain Pen Set',
  'Custom Gift Hamper',
  'Washi Tapes',
  'Calligraphy Ink',
  'Minimalist Desk Mat',
  'Birthday Pop-up Card',
  'Wax Seal Stamp Kit',
];

export const POPULAR_SEARCH_COLLECTIONS = [
  { label: 'Gifts under ₹999', href: '/collections/under-999', tag: 'Budget' },
  { label: 'Executive Pens', href: '/collections/writing?sub=pens', tag: 'Luxury' },
  { label: 'Artisan Diaries', href: '/collections/stationery?sub=diaries', tag: 'Bestseller' },
  { label: 'Corporate Gifting', href: '/corporate', tag: 'Bulk' },
];

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'gifts',
    name: 'Gifts',
    slug: 'gifts',
    href: '/collections/gifts',
    hasMegaMenu: true,
    columns: [
      {
        title: 'By Recipient',
        items: [
          { name: 'Gifts for Him', href: '/collections/gifts?for=him' },
          { name: 'Gifts for Her', href: '/collections/gifts?for=her' },
          { name: 'Gifts for Colleagues', href: '/collections/gifts?for=colleagues' },
          { name: 'Gifts for Artists & Writers', href: '/collections/gifts?for=creatives', isHot: true },
          { name: 'Gifts for Kids & Teens', href: '/collections/gifts?for=kids' },
        ],
      },
      {
        title: 'By Occasion',
        items: [
          { name: 'Birthday Specials', href: '/collections/gifts?occ=birthday', isHot: true },
          { name: 'Anniversary & Romantic', href: '/collections/gifts?occ=anniversary' },
          { name: 'Housewarming Gifts', href: '/collections/gifts?occ=housewarming' },
          { name: 'Farewell & Congratulations', href: '/collections/gifts?occ=farewell' },
          { name: 'Festive & Celebration', href: '/collections/gifts?occ=festive' },
        ],
      },
      {
        title: 'Curated Hampers',
        items: [
          { name: 'Luxury Gift Boxes', href: '/collections/gifts?type=luxury-boxes', isNew: true },
          { name: 'Stationery Gift Hampers', href: '/collections/gifts?type=stationery-hampers', isHot: true },
          { name: 'Coffee & Journal Sets', href: '/collections/gifts?type=coffee-journal' },
          { name: 'Self-Care & Desk Glow', href: '/collections/gifts?type=self-care' },
          { name: 'Build Your Own Hamper', href: '/build-a-box', isNew: true },
        ],
      },
    ],
    promoCard: {
      title: 'Handcrafted Gift Hampers',
      subtitle: 'Packed with love, custom notes & wax-sealed satin ribbons.',
      badge: 'Bestselling Collection',
      ctaText: 'Explore Hampers',
      ctaHref: '/collections/gifts?type=stationery-hampers',
      tagline: 'Dispatches in 24 Hours',
    },
  },
  {
    id: 'stationery',
    name: 'Stationery',
    slug: 'stationery',
    href: '/collections/stationery',
    hasMegaMenu: true,
    columns: [
      {
        title: 'Diaries & Notebooks',
        items: [
          { name: 'Hardbound Journals', href: '/collections/stationery?sub=hardbound', isHot: true },
          { name: 'Dotted Bullet Journals', href: '/collections/stationery?sub=bujo' },
          { name: 'Daily & Weekly Planners', href: '/collections/stationery?sub=planners', isNew: true },
          { name: 'Pocket Notepads', href: '/collections/stationery?sub=pocket-pads' },
          { name: 'Handmade Deckle Paper', href: '/collections/stationery?sub=deckle-paper' },
        ],
      },
      {
        title: 'Desk & Organizing',
        items: [
          { name: 'Sticky Notes & Page Flags', href: '/collections/stationery?sub=sticky-notes' },
          { name: 'Washi Tapes & Stickers', href: '/collections/stationery?sub=washi-tapes', isHot: true },
          { name: 'Desk Trays & Pen Stands', href: '/collections/stationery?sub=pen-stands' },
          { name: 'Bookmarks & Book Sleeves', href: '/collections/stationery?sub=bookmarks' },
          { name: 'Paper Clips & Binder Pins', href: '/collections/stationery?sub=clips' },
        ],
      },
      {
        title: 'Cards & Envelopes',
        items: [
          { name: 'Letter Writing Sets', href: '/collections/stationery?sub=letter-sets', isNew: true },
          { name: 'Wax Seals & Sealing Wax', href: '/collections/stationery?sub=wax-seals' },
          { name: 'Vintage Postal Stamps', href: '/collections/stationery?sub=vintage-stamps' },
          { name: 'Handmade Envelopes', href: '/collections/stationery?sub=envelopes' },
        ],
      },
    ],
    promoCard: {
      title: 'Aesthetic Japanese & Korean Paper',
      subtitle: 'Bleed-proof 120 GSM ultra-smooth archival paper for fountain pens.',
      badge: 'Curator Pick',
      ctaText: 'Shop Planners & Journals',
      ctaHref: '/collections/stationery?sub=planners',
      tagline: 'Refillable Formats Available',
    },
  },
  {
    id: 'writing',
    name: 'Writing',
    slug: 'writing',
    href: '/collections/writing',
    hasMegaMenu: true,
    columns: [
      {
        title: 'Fine Pens',
        items: [
          { name: 'Fountain Pens', href: '/collections/writing?sub=fountain-pens', isHot: true },
          { name: 'Rollerball & Gel Pens', href: '/collections/writing?sub=gel-pens' },
          { name: 'Brass & Metal Body Pens', href: '/collections/writing?sub=metal-pens', isNew: true },
          { name: 'Luxury Pen Gift Sets', href: '/collections/writing?sub=gift-sets' },
          { name: 'Mechanical Pencils', href: '/collections/writing?sub=mechanical-pencils' },
        ],
      },
      {
        title: 'Calligraphy & Art Pens',
        items: [
          { name: 'Brush Pens & Dual Tips', href: '/collections/writing?sub=brush-pens' },
          { name: 'Glass Dip Pens', href: '/collections/writing?sub=glass-pens', isNew: true },
          { name: 'Calligraphy Nibs & Holders', href: '/collections/writing?sub=calligraphy-nibs' },
          { name: 'Fineliners & Microns', href: '/collections/writing?sub=fineliners' },
          { name: 'Pastel Highlighters', href: '/collections/writing?sub=highlighters' },
        ],
      },
      {
        title: 'Inks & Accessories',
        items: [
          { name: 'Bottled Fountain Pen Inks', href: '/collections/writing?sub=bottled-inks', isHot: true },
          { name: 'Shimmer & Sheen Inks', href: '/collections/writing?sub=shimmer-inks' },
          { name: 'Ink Cartridges & Converters', href: '/collections/writing?sub=converters' },
          { name: 'Leather Pen Sleeves & Pouches', href: '/collections/writing?sub=pen-pouches' },
        ],
      },
    ],
    promoCard: {
      title: 'Precision Craftsmanship',
      subtitle: 'Discover German & Japanese precision nibs with effortless glide.',
      badge: 'Collector Choice',
      ctaText: 'Browse Fine Pens',
      ctaHref: '/collections/writing?sub=fountain-pens',
      tagline: 'Custom Engraving Available',
    },
  },
  {
    id: 'art-craft',
    name: 'Art & Craft',
    slug: 'art-craft',
    href: '/collections/art-craft',
    hasMegaMenu: true,
    columns: [
      {
        title: 'Paints & Colors',
        items: [
          { name: 'Artist Watercolor Sets', href: '/collections/art-craft?sub=watercolors', isHot: true },
          { name: 'Gouache & Acrylic Paints', href: '/collections/art-craft?sub=gouache' },
          { name: 'Metallic & Shimmer Paints', href: '/collections/art-craft?sub=metallic-paints' },
          { name: 'Oil Pastels & Soft Pastels', href: '/collections/art-craft?sub=pastels' },
        ],
      },
      {
        title: 'Paper & Canvas',
        items: [
          { name: '100% Cotton Watercolor Paper', href: '/collections/art-craft?sub=cotton-paper', isHot: true },
          { name: 'Mixed Media Sketchbooks', href: '/collections/art-craft?sub=mixed-media' },
          { name: 'Black Paper Sketchbooks', href: '/collections/art-craft?sub=black-paper' },
          { name: 'Canvas Panels & Boards', href: '/collections/art-craft?sub=canvas' },
        ],
      },
      {
        title: 'Craft & DIY Tools',
        items: [
          { name: 'Paper Guillotines & Punches', href: '/collections/art-craft?sub=punches' },
          { name: 'Rubber Stamps & Ink Pads', href: '/collections/art-craft?sub=stamps', isNew: true },
          { name: 'Origami & Craft Papers', href: '/collections/art-craft?sub=craft-paper' },
          { name: 'Beginner DIY Craft Kits', href: '/collections/art-craft?sub=craft-kits' },
        ],
      },
    ],
    promoCard: {
      title: 'Express Your Creativity',
      subtitle: 'Curated professional art supplies for illustrators, crafters & hobbyists.',
      badge: 'Artisan Hub',
      ctaText: 'Shop Art Supplies',
      ctaHref: '/collections/art-craft',
      tagline: 'Acid-Free & Lightfast',
    },
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    slug: 'office-supplies',
    href: '/collections/office-supplies',
    hasMegaMenu: true,
    columns: [
      {
        title: 'Desk Essentials',
        items: [
          { name: 'Vegan Leather Desk Mats', href: '/collections/office-supplies?sub=desk-mats', isHot: true },
          { name: 'Acrylic & Wood Organizers', href: '/collections/office-supplies?sub=organizers' },
          { name: 'Cable Managers & Clips', href: '/collections/office-supplies?sub=cable-management' },
          { name: 'Ergonomic Wrist Rests', href: '/collections/office-supplies?sub=wrist-rests' },
        ],
      },
      {
        title: 'Filing & Document Care',
        items: [
          { name: 'Executive Document Folios', href: '/collections/office-supplies?sub=folios', isNew: true },
          { name: 'Accordion Expanding Files', href: '/collections/office-supplies?sub=expanding-files' },
          { name: 'Business Card Holders', href: '/collections/office-supplies?sub=card-holders' },
          { name: 'Certificate Folders', href: '/collections/office-supplies?sub=certificate-folders' },
        ],
      },
    ],
    promoCard: {
      title: 'Modern Minimal Workspace',
      subtitle: 'Upgrade your productivity sanctuary with aesthetic executive tools.',
      badge: 'Work From Home',
      ctaText: 'Shop Desk Setup',
      ctaHref: '/collections/office-supplies?sub=desk-mats',
      tagline: 'Waterproof & Scratch-Resistant',
    },
  },
  {
    id: 'personalized',
    name: 'Personalized Gifts',
    slug: 'personalized-gifts',
    href: '/collections/personalized-gifts',
    hasMegaMenu: true,
    columns: [
      {
        title: 'Custom Engraved',
        items: [
          { name: 'Laser Engraved Metal Pens', href: '/collections/personalized-gifts?sub=pens', isHot: true },
          { name: 'Gold Foil Monogram Diaries', href: '/collections/personalized-gifts?sub=diaries', isHot: true },
          { name: 'Personalized Leather Bookmarks', href: '/collections/personalized-gifts?sub=bookmarks' },
          { name: 'Custom Name Desk Nameplates', href: '/collections/personalized-gifts?sub=nameplates', isNew: true },
        ],
      },
      {
        title: 'Bespoke Keepsakes',
        items: [
          { name: 'Personalized Gift Hampers', href: '/collections/personalized-gifts?sub=hampers' },
          { name: 'Photo & Quote Desk Frames', href: '/collections/personalized-gifts?sub=frames' },
          { name: 'Custom Wax Seal Stamp Kits', href: '/collections/personalized-gifts?sub=wax-stamps', isNew: true },
          { name: 'Hand-Lettered Message Scrolls', href: '/collections/personalized-gifts?sub=scrolls' },
        ],
      },
    ],
    promoCard: {
      title: 'Make It Uniquely Theirs',
      subtitle: 'Free laser engraving and bespoke monogram embossing on eligible gifts.',
      badge: 'Personalization Studio',
      ctaText: 'Customize Now',
      ctaHref: '/collections/personalized-gifts',
      tagline: 'Preview Customization Live',
    },
  },
  {
    id: 'corporate-gifts',
    name: 'Corporate Gifts',
    slug: 'corporate-gifts',
    href: '/corporate',
    hasMegaMenu: false,
  },
  {
    id: 'diaries-notebooks',
    name: 'Diaries & Notebooks',
    slug: 'diaries-notebooks',
    href: '/collections/stationery?sub=diaries',
    hasMegaMenu: false,
  },
  {
    id: 'greeting-cards',
    name: 'Greeting Cards',
    slug: 'greeting-cards',
    href: '/collections/greeting-cards',
    hasMegaMenu: false,
  },
  {
    id: 'gift-hampers',
    name: 'Gift Hampers',
    slug: 'gift-hampers',
    href: '/collections/gifts?type=stationery-hampers',
    hasMegaMenu: false,
  },
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    slug: 'best-sellers',
    href: '/collections/best-sellers',
    hasMegaMenu: false,
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    href: '/collections/new-arrivals',
    hasMegaMenu: false,
    badge: {
      text: 'NEW',
      variant: 'purple',
    },
  },
  {
    id: 'offers',
    name: 'Offers',
    slug: 'offers',
    href: '/collections/offers',
    hasMegaMenu: false,
    badge: {
      text: 'SALE',
      variant: 'gold',
    },
  },
];

export const VISUAL_CATEGORY_STRIP: VisualCategoryItem[] = [
  {
    id: 'v-gifts',
    name: 'Curated Gifts',
    href: '/collections/gifts',
    iconName: 'Gift',
    badge: 'Popular',
  },
  {
    id: 'v-diaries',
    name: 'Diaries & Planners',
    href: '/collections/stationery?sub=diaries',
    iconName: 'BookOpen',
  },
  {
    id: 'v-pens',
    name: 'Fine Pens',
    href: '/collections/writing',
    iconName: 'PenTool',
  },
  {
    id: 'v-art',
    name: 'Art Supplies',
    href: '/collections/art-craft?sub=watercolors',
    iconName: 'Palette',
  },
  {
    id: 'v-craft',
    name: 'Craft & DIY',
    href: '/collections/art-craft?sub=craft-paper',
    iconName: 'Sparkles',
  },
  {
    id: 'v-office',
    name: 'Desk & Office',
    href: '/collections/office-supplies',
    iconName: 'Briefcase',
  },
  {
    id: 'v-birthday',
    name: 'Birthday Gifts',
    href: '/collections/gifts?occ=birthday',
    iconName: 'PartyPopper',
    highlight: true,
  },
  {
    id: 'v-personalized',
    name: 'Personalized',
    href: '/collections/personalized-gifts',
    iconName: 'HeartHandshake',
    badge: 'Custom',
  },
  {
    id: 'v-hampers',
    name: 'Luxury Hampers',
    href: '/collections/gifts?type=stationery-hampers',
    iconName: 'PackageOpen',
    badge: 'Hot',
  },
  {
    id: 'v-cards',
    name: 'Greeting Cards',
    href: '/collections/greeting-cards',
    iconName: 'MailOpen',
  },
  {
    id: 'v-desk-decor',
    name: 'Desk Decor',
    href: '/collections/office-supplies?sub=organizers',
    iconName: 'Layers',
  },
  {
    id: 'v-under-499',
    name: 'Under ₹499',
    href: '/collections/under-499',
    iconName: 'Tag',
    highlight: true,
  },
];
