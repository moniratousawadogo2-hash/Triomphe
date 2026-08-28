export type UnitType = 'kg' | 'g' | 'L' | 'cl' | 'piece' | 'bouteille' | 'portion';

export type IngredientCategory = 
  | 'viandes' 
  | 'poissons' 
  | 'legumes' 
  | 'produits_laitiers' 
  | 'boissons' 
  | 'epicerie' 
  | 'boulangerie';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  currentStock: number;
  minThreshold: number;
  optimalStock: number;
  unit: UnitType;
  costPerUnit: number; // in F CFA
  supplier: string;
  supplierRef?: string;
  lastRestockedAt?: string;
  storageLocation?: 'Chambre froide positive' | 'Chambre froide négative' | 'Réserve sèche' | 'Cave à vins' | 'Bar';
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number; // in the unit of the ingredient
  unit: UnitType;
}

export type MenuCategory = 'entrees' | 'plats' | 'burgers' | 'desserts' | 'boissons' | 'vins' | 'formules';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number; // in F CFA TTC
  tva: 10 | 20; // 10% food/soft, 20% alcohol
  description: string;
  allergens: string[];
  recipe: RecipeItem[];
  prepTimeMinutes: number;
  badge?: 'Chef' | 'Populaire' | 'Bio' | 'Végétarien' | 'Nouveau';
  isManuallyDisabled?: boolean;
  colorTag?: string;
}

export type TableStatus = 'libre' | 'occupee' | 'addition' | 'reservee';
export type TableZone = 'Salle Principale' | 'Terrasse Extérieure' | 'Espace Bar' | 'Mezzanine VIP';

export const RESTAURANT_SERVERS = ['Man', 'Women', 'Boy', 'Girl'] as const;
export type ServerName = typeof RESTAURANT_SERVERS[number];

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  zone: TableZone;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  serverName?: string;
  guestCount?: number;
  seatedAt?: string; // ISO string
}

export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served';
export type CourseType = 'apero' | 'entree' | 'plat' | 'dessert' | 'boisson' | 'digestif';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  course: CourseType;
  status: OrderItemStatus;
  specialInstructions?: string; // e.g. "Saignant, sans sel"
  addedAt: string;
}

export type OrderStatus = 'in_progress' | 'sent_to_kitchen' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface RestaurantOrder {
  id: string;
  orderNumber: number;
  tableId: string;
  tableName: string;
  zone: TableZone;
  serverName: string;
  guestCount: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  sentToKitchenAt?: string;
  completedAt?: string;
  paymentMethod?: 'cb' | 'especes' | 'ticket_resto' | 'cheque' | 'divise';
  notes?: string;
  paidAmount?: number;
}

export type MovementType = 'order_deduction' | 'restock' | 'waste' | 'inventory_adjustment';

export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  timestamp: string;
  type: MovementType;
  quantityChange: number; // negative for deductions/waste, positive for restock
  unit: UnitType;
  reason: string;
  orderId?: string;
  orderNumber?: number;
  user: string;
  costImpact?: number;
}

export interface SupplierOrder {
  id: string;
  supplierName: string;
  date: string;
  status: 'brouillon' | 'envoye' | 'recu';
  items: {
    ingredientId: string;
    ingredientName: string;
    quantityToOrder: number;
    unit: UnitType;
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
}

export type UserRole = 'serveur' | 'cuisine' | 'gerant' | 'barman';

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  totalGuests: number;
  averageTicket: number;
  cardRevenue: number;
  cashRevenue: number;
  ticketRestoRevenue: number;
  foodCostPercentage: number;
}
