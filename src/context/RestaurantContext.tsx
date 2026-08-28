import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Ingredient, 
  MenuItem, 
  RestaurantTable, 
  RestaurantOrder, 
  StockMovement, 
  UserRole, 
  TableStatus,
  OrderItem,
  SupplierOrder
} from '../types';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_ORDERS, 
  INITIAL_STOCK_MOVEMENTS 
} from '../data/initialData';
import { 
  playOrderSentSound, 
  playKitchenBellSound, 
  playStockAlertSound, 
  playPaymentSuccessSound 
} from '../utils/audio';
import { formatCurrency } from '../utils/currency';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export type ActiveTab = 
  | 'plan_salle' 
  | 'prise_commande' 
  | 'cuisine_kds' 
  | 'stocks' 
  | 'recettes' 
  | 'analyses' 
  | 'caisse';

interface RestaurantContextType {
  ingredients: Ingredient[];
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  orders: RestaurantOrder[];
  stockMovements: StockMovement[];
  supplierOrders: SupplierOrder[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  mobileViewMode: boolean;
  setMobileViewMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;

  // Table actions
  occupyTable: (tableId: string, guestCount: number, serverName: string) => string; // returns orderId
  setTableStatus: (tableId: string, status: TableStatus) => void;
  releaseTable: (tableId: string) => void;

  // Order actions
  getActiveOrderByTableId: (tableId: string) => RestaurantOrder | undefined;
  getOrderById: (orderId: string) => RestaurantOrder | undefined;
  addItemToOrder: (orderId: string, menuItem: MenuItem, course?: OrderItem['course'], specialInstructions?: string) => void;
  removeItemFromOrder: (orderId: string, orderItemId: string) => void;
  updateOrderItemQty: (orderId: string, orderItemId: string, delta: number) => void;
  sendOrderToKitchen: (orderId: string) => boolean;
  updateOrderItemStatus: (orderId: string, orderItemId: string, status: OrderItem['status']) => void;
  markOrderAllItemsReady: (orderId: string) => void;
  markOrderServed: (orderId: string) => void;
  checkoutAndPayOrder: (orderId: string, paymentMethod: 'cb' | 'especes' | 'ticket_resto' | 'cheque' | 'divise', notes?: string) => void;

  // Stock actions
  restockIngredient: (ingredientId: string, quantityToAdd: number, reason?: string, cost?: number) => void;
  declareStockLoss: (ingredientId: string, quantityLost: number, reason: string) => void;
  adjustStockDirectly: (ingredientId: string, newStockQuantity: number, reason: string) => void;
  createIngredient: (newIng: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (updatedIng: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  generateSupplierOrder: () => SupplierOrder;
  markSupplierOrderReceived: (supplierOrderId: string) => void;

  // Menu & Recipe actions
  createMenuItem: (newItem: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (updatedItem: MenuItem) => void;
  toggleMenuItemStatus: (menuItemId: string) => void;
  calculateDishMaxPortions: (item: MenuItem) => { maxPortions: number; limitingIngredient?: Ingredient };
  calculateDishCost: (item: MenuItem) => { cost: number; marginRatio: number; foodCostPercent: number };

  // Utilities
  resetDemoData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INGREDIENTS: 'triomphe_resto_ingredients_fcfa_v2',
  MENU_ITEMS: 'triomphe_resto_menu_fcfa_v2',
  TABLES: 'triomphe_resto_tables_fcfa_v2',
  ORDERS: 'triomphe_resto_orders_fcfa_v2',
  MOVEMENTS: 'triomphe_resto_movements_fcfa_v2',
  SUPPLIER_ORDERS: 'triomphe_resto_supplier_orders_fcfa_v2',
};

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial data
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [orders, setOrders] = useState<RestaurantOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIER_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('serveur');
  const [activeTab, setActiveTab] = useState<ActiveTab>('prise_commande');
  const [selectedTableId, setSelectedTableId] = useState<string | null>('tbl-2');
  const [mobileViewMode, setMobileViewMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIER_ORDERS, JSON.stringify(supplierOrders));
  }, [supplierOrders]);

  // Toast manager
  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      timestamp: Date.now(),
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to find active order for table
  const getActiveOrderByTableId = (tableId: string): RestaurantOrder | undefined => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || !table.currentOrderId) return undefined;
    return orders.find((o) => o.id === table.currentOrderId && o.status !== 'paid' && o.status !== 'cancelled');
  };

  const getOrderById = (orderId: string): RestaurantOrder | undefined => {
    return orders.find((o) => o.id === orderId);
  };

  // Occupy a table
  const occupyTable = (tableId: string, guestCount: number, serverName: string): string => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return '';

    const newOrderNumber = Math.max(...orders.map((o) => o.orderNumber), 100) + 1;
    const newOrderId = 'ord-' + Date.now();

    const newOrder: RestaurantOrder = {
      id: newOrderId,
      orderNumber: newOrderNumber,
      tableId: table.id,
      tableName: table.name,
      zone: table.zone,
      serverName: serverName || 'Man',
      guestCount: guestCount || table.capacity,
      status: 'in_progress',
      items: [],
      totalAmount: 0,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'occupee',
              currentOrderId: newOrderId,
              serverName: serverName || 'Man',
              guestCount: guestCount || table.capacity,
              seatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    addToast('Table ouverte', `${table.name} ouverte pour ${guestCount} couverts.`, 'success');
    return newOrderId;
  };

  const setTableStatus = (tableId: string, status: TableStatus) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status } : t))
    );
  };

  const releaseTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'libre',
              currentOrderId: undefined,
              serverName: undefined,
              guestCount: undefined,
              seatedAt: undefined,
            }
          : t
      )
    );
  };

  // Dish availability calculation based on current stock of its recipe ingredients
  const calculateDishMaxPortions = (item: MenuItem): { maxPortions: number; limitingIngredient?: Ingredient } => {
    if (!item.recipe || item.recipe.length === 0) {
      return { maxPortions: 999 };
    }

    let minPortions = Infinity;
    let limitingIng: Ingredient | undefined = undefined;

    for (const recipeItem of item.recipe) {
      const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
      if (!ing) continue;

      if (recipeItem.quantity <= 0) continue;
      const possible = Math.floor(Math.max(0, ing.currentStock) / recipeItem.quantity);

      if (possible < minPortions) {
        minPortions = possible;
        limitingIng = ing;
      }
    }

    return {
      maxPortions: minPortions === Infinity ? 999 : minPortions,
      limitingIngredient: limitingIng,
    };
  };

  // Dish cost and food cost % calculation
  const calculateDishCost = (item: MenuItem): { cost: number; marginRatio: number; foodCostPercent: number } => {
    let cost = 0;
    if (item.recipe) {
      for (const recipeItem of item.recipe) {
        const ing = ingredients.find((i) => i.id === recipeItem.ingredientId);
        if (ing) {
          cost += ing.costPerUnit * recipeItem.quantity;
        }
      }
    }

    const priceHT = item.price / (1 + item.tva / 100);
    const marginRatio = cost > 0 ? Number((priceHT / cost).toFixed(2)) : 0;
    const foodCostPercent = priceHT > 0 ? Number(((cost / priceHT) * 100).toFixed(1)) : 0;

    return {
      cost: Number(cost.toFixed(2)),
      marginRatio,
      foodCostPercent,
    };
  };

  // Order item management
  const addItemToOrder = (
    orderId: string, 
    menuItem: MenuItem, 
    course?: OrderItem['course'], 
    specialInstructions?: string
  ) => {
    // Determine course default
    let defaultCourse: OrderItem['course'] = 'plat';
    if (menuItem.category === 'entrees') defaultCourse = 'entree';
    else if (menuItem.category === 'desserts') defaultCourse = 'dessert';
    else if (menuItem.category === 'boissons' || menuItem.category === 'vins') defaultCourse = 'boisson';

    const targetCourse = course || defaultCourse;

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id !== orderId) return ord;

        // Check if identical item already in order (with same instructions and course)
        const existingItemIndex = ord.items.findIndex(
          (it) =>
            it.menuItemId === menuItem.id &&
            it.course === targetCourse &&
            (it.specialInstructions || '') === (specialInstructions || '') &&
            it.status === 'pending' // Only group if not yet sent
        );

        let updatedItems: OrderItem[];

        if (existingItemIndex > -1) {
          updatedItems = ord.items.map((it, idx) =>
            idx === existingItemIndex ? { ...it, quantity: it.quantity + 1 } : it
          );
        } else {
          const newItem: OrderItem = {
            id: 'oi-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            menuItemId: menuItem.id,
            menuItemName: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            course: targetCourse,
            status: 'pending',
            specialInstructions: specialInstructions?.trim() || undefined,
            addedAt: new Date().toISOString(),
          };
          updatedItems = [...ord.items, newItem];
        }

        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

        return {
          ...ord,
          items: updatedItems,
          totalAmount: Number(newTotal.toFixed(2)),
        };
      })
    );
  };

  const removeItemFromOrder = (orderId: string, orderItemId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedItems = ord.items.filter((it) => it.id !== orderItemId);
        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        return {
          ...ord,
          items: updatedItems,
          totalAmount: Number(newTotal.toFixed(2)),
        };
      })
    );
  };

  const updateOrderItemQty = (orderId: string, orderItemId: string, delta: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedItems = ord.items
          .map((it) => {
            if (it.id !== orderItemId) return it;
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          })
          .filter(Boolean) as OrderItem[];

        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        return {
          ...ord,
          items: updatedItems,
          totalAmount: Number(newTotal.toFixed(2)),
        };
      })
    );
  };

  // SEND ORDER TO KITCHEN & REAL-TIME STOCK DEDUCTION
  const sendOrderToKitchen = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.items.length === 0) return false;

    // Find items that are pending (not yet sent)
    const pendingItems = order.items.filter((it) => it.status === 'pending');
    if (pendingItems.length === 0 && order.status === 'sent_to_kitchen') {
      addToast('Information', 'Tous les articles ont déjà été envoyés en cuisine.', 'info');
      return true;
    }

    const itemsToProcess = pendingItems.length > 0 ? pendingItems : order.items;

    // Calculate ingredient deductions
    const deductionsMap = new Map<string, { quantity: number; ingredientName: string; unit: string; costPerUnit: number }>();
    const triggeredAlerts: string[] = [];

    itemsToProcess.forEach((orderItem) => {
      const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
      if (!menuItem || !menuItem.recipe) return;

      menuItem.recipe.forEach((r) => {
        const current = deductionsMap.get(r.ingredientId) || {
          quantity: 0,
          ingredientName: r.ingredientName,
          unit: r.unit,
          costPerUnit: 0,
        };
        const ing = ingredients.find((i) => i.id === r.ingredientId);
        current.quantity += r.quantity * orderItem.quantity;
        current.costPerUnit = ing?.costPerUnit || 0;
        deductionsMap.set(r.ingredientId, current);
      });
    });

    // Create new stock movement entries and update ingredient stocks
    const newMovements: StockMovement[] = [];
    const updatedIngredients = [...ingredients];

    deductionsMap.forEach((deduction, ingId) => {
      const ingIndex = updatedIngredients.findIndex((i) => i.id === ingId);
      if (ingIndex > -1) {
        const ing = updatedIngredients[ingIndex];
        const oldStock = ing.currentStock;
        const newStock = Math.max(0, Number((oldStock - deduction.quantity).toFixed(3)));

        updatedIngredients[ingIndex] = {
          ...ing,
          currentStock: newStock,
        };

        const costImpact = -(deduction.quantity * deduction.costPerUnit);

        newMovements.push({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          ingredientId: ingId,
          ingredientName: ing.name,
          timestamp: new Date().toISOString(),
          type: 'order_deduction',
          quantityChange: -Number(deduction.quantity.toFixed(3)),
          unit: ing.unit,
          reason: `Commande #${order.orderNumber} (${order.tableName})`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          user: order.serverName,
          costImpact: Number(costImpact.toFixed(2)),
        });

        // Check if dropping below threshold
        if (newStock <= ing.minThreshold && oldStock > ing.minThreshold) {
          triggeredAlerts.push(`${ing.name}: Stock bas (${newStock} ${ing.unit} restants / seuil ${ing.minThreshold})`);
        } else if (newStock === 0) {
          triggeredAlerts.push(`RUPTURE IMMÉDIATE: ${ing.name} (0 ${ing.unit})`);
        }
      }
    });

    // Update ingredients & movements in state
    setIngredients(updatedIngredients);
    setStockMovements((prev) => [...newMovements, ...prev]);

    // Update order status & item status to 'preparing'
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'sent_to_kitchen',
              sentToKitchenAt: o.sentToKitchenAt || new Date().toISOString(),
              items: o.items.map((it) =>
                it.status === 'pending' ? { ...it, status: 'preparing' } : it
              ),
            }
          : o
      )
    );

    // Audio feedback
    if (soundEnabled) {
      playOrderSentSound();
      setTimeout(() => {
        playKitchenBellSound();
      }, 250);
    }

    addToast(
      'Bon Cuisine Envoyé !',
      `Commande #${order.orderNumber} (${order.tableName}) transmise au KDS Cuisine. Stocks déduits en direct.`,
      'success'
    );

    // If any ingredient reached critical alert
    if (triggeredAlerts.length > 0) {
      if (soundEnabled) playStockAlertSound();
      triggeredAlerts.forEach((alert) => {
        addToast('Alerte Stock', alert, 'warning');
      });
    }

    return true;
  };

  const updateOrderItemStatus = (orderId: string, orderItemId: string, status: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map((it) =>
          it.id === orderItemId ? { ...it, status } : it
        );

        // Check if all items are ready
        const allReady = updatedItems.every((it) => it.status === 'ready' || it.status === 'served');
        const allServed = updatedItems.every((it) => it.status === 'served');

        let newOrderStatus = o.status;
        if (allServed) newOrderStatus = 'served';
        else if (allReady) newOrderStatus = 'ready';

        return {
          ...o,
          status: newOrderStatus,
          items: updatedItems,
        };
      })
    );

    if (status === 'ready' && soundEnabled) {
      playKitchenBellSound();
    }
  };

  const markOrderAllItemsReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'ready',
              items: o.items.map((it) => ({ ...it, status: 'ready' })),
            }
          : o
      )
    );

    if (soundEnabled) playKitchenBellSound();
    const order = orders.find((o) => o.id === orderId);
    addToast('Commande Prête', `La commande #${order?.orderNumber || ''} (${order?.tableName || ''}) est prête au passe !`, 'success');
  };

  const markOrderServed = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'served',
              items: o.items.map((it) => ({ ...it, status: 'served' })),
            }
          : o
      )
    );
  };

  // CHECKOUT & BILLING
  const checkoutAndPayOrder = (
    orderId: string,
    paymentMethod: 'cb' | 'especes' | 'ticket_resto' | 'cheque' | 'divise',
    notes?: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'paid',
              completedAt: new Date().toISOString(),
              paymentMethod,
              notes,
              paidAmount: o.totalAmount,
            }
          : o
      )
    );

    // Free the table
    releaseTable(order.tableId);

    if (soundEnabled) playPaymentSuccessSound();

    addToast(
      'Addition Encaissée',
      `Table ${order.tableName} libérée. Montant: ${formatCurrency(order.totalAmount)} (${paymentMethod.toUpperCase()})`,
      'success'
    );
  };

  // STOCK ACTIONS
  const restockIngredient = (ingredientId: string, quantityToAdd: number, reason = 'Réception marchandise', cost?: number) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing || quantityToAdd <= 0) return;

    const newStock = Number((ing.currentStock + quantityToAdd).toFixed(3));
    const costImpact = cost || Number((quantityToAdd * ing.costPerUnit).toFixed(2));

    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, currentStock: newStock, lastRestockedAt: new Date().toISOString() } : i))
    );

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      ingredientId,
      ingredientName: ing.name,
      timestamp: new Date().toISOString(),
      type: 'restock',
      quantityChange: quantityToAdd,
      unit: ing.unit,
      reason,
      user: currentRole.toUpperCase(),
      costImpact,
    };

    setStockMovements((prev) => [movement, ...prev]);
    addToast('Stock Réapprovisionné', `+${quantityToAdd} ${ing.unit} de ${ing.name} (Nouveau stock: ${newStock} ${ing.unit})`, 'success');
  };

  const declareStockLoss = (ingredientId: string, quantityLost: number, reason: string) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing || quantityLost <= 0) return;

    const newStock = Math.max(0, Number((ing.currentStock - quantityLost).toFixed(3)));
    const costImpact = -Number((quantityLost * ing.costPerUnit).toFixed(2));

    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, currentStock: newStock } : i))
    );

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      ingredientId,
      ingredientName: ing.name,
      timestamp: new Date().toISOString(),
      type: 'waste',
      quantityChange: -quantityLost,
      unit: ing.unit,
      reason: `Gaspillage / Perte: ${reason}`,
      user: currentRole.toUpperCase(),
      costImpact,
    };

    setStockMovements((prev) => [movement, ...prev]);
    addToast('Perte Enregistrée', `-${quantityLost} ${ing.unit} de ${ing.name} pour motif: ${reason}`, 'warning');
  };

  const adjustStockDirectly = (ingredientId: string, newStockQuantity: number, reason: string) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;

    const diff = Number((newStockQuantity - ing.currentStock).toFixed(3));
    const costImpact = Number((diff * ing.costPerUnit).toFixed(2));

    setIngredients((prev) =>
      prev.map((i) => (i.id === ingredientId ? { ...i, currentStock: Math.max(0, newStockQuantity) } : i))
    );

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      ingredientId,
      ingredientName: ing.name,
      timestamp: new Date().toISOString(),
      type: 'inventory_adjustment',
      quantityChange: diff,
      unit: ing.unit,
      reason: `Inventaire: ${reason}`,
      user: currentRole.toUpperCase(),
      costImpact,
    };

    setStockMovements((prev) => [movement, ...prev]);
    addToast('Inventaire Ajusté', `Stock de ${ing.name} fixé à ${newStockQuantity} ${ing.unit}`, 'info');
  };

  const createIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const created: Ingredient = {
      ...newIng,
      id: 'ing-' + Date.now(),
    };
    setIngredients((prev) => [...prev, created]);
    addToast('Ingrédient Créé', `${created.name} ajouté au catalogue matière.`, 'success');
  };

  const updateIngredient = (updated: Ingredient) => {
    setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    addToast('Ingrédient Mis à Jour', `${updated.name} modifié.`, 'info');
  };

  const deleteIngredient = (ingredientId: string) => {
    const ing = ingredients.find((i) => i.id === ingredientId);
    setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
    addToast('Ingrédient Supprimé', `${ing?.name || 'Ingrédient'} retiré du stock.`, 'info');
  };

  // Supplier automatic order generation for items under threshold
  const generateSupplierOrder = (): SupplierOrder => {
    const lowStockItems = ingredients.filter((ing) => ing.currentStock <= ing.minThreshold);
    
    const items = lowStockItems.map((ing) => {
      const qtyToOrder = Math.max(1, Number((ing.optimalStock - ing.currentStock).toFixed(1)));
      return {
        ingredientId: ing.id,
        ingredientName: ing.name,
        quantityToOrder: qtyToOrder,
        unit: ing.unit,
        estimatedCost: Number((qtyToOrder * ing.costPerUnit).toFixed(2)),
      };
    });

    const totalEstimatedCost = Number(items.reduce((acc, curr) => acc + curr.estimatedCost, 0).toFixed(2));

    const newSupplierOrder: SupplierOrder = {
      id: 'po-' + Date.now(),
      supplierName: 'Commandes Fournisseurs Rungis & Terroir',
      date: new Date().toISOString(),
      status: 'brouillon',
      items,
      totalEstimatedCost,
    };

    setSupplierOrders((prev) => [newSupplierOrder, ...prev]);
    addToast(
      'Bon de Réapprovisionnement',
      `${items.length} ingrédients en alerte ajoutés au bon de commande (${formatCurrency(totalEstimatedCost)}).`,
      'info'
    );
    return newSupplierOrder;
  };

  const markSupplierOrderReceived = (supplierOrderId: string) => {
    const sOrder = supplierOrders.find((s) => s.id === supplierOrderId);
    if (!sOrder) return;

    // Apply restocks for each item in the supplier order
    sOrder.items.forEach((item) => {
      restockIngredient(item.ingredientId, item.quantityToOrder, `Réception Bon Commande ${sOrder.id}`, item.estimatedCost);
    });

    setSupplierOrders((prev) =>
      prev.map((s) => (s.id === supplierOrderId ? { ...s, status: 'recu' } : s))
    );

    addToast('Livraison Réceptionnée', `Tous les articles du bon ont été crédités aux stocks.`, 'success');
  };

  // MENU ACTIONS
  const createMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const created: MenuItem = {
      ...newItem,
      id: 'menu-' + Date.now(),
    };
    setMenuItems((prev) => [...prev, created]);
    addToast('Plat Ajouté', `${created.name} ajouté à la carte.`, 'success');
  };

  const updateMenuItem = (updated: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    addToast('Carte Mise à Jour', `${updated.name} modifié.`, 'info');
  };

  const toggleMenuItemStatus = (menuItemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === menuItemId ? { ...m, isManuallyDisabled: !m.isManuallyDisabled } : m
      )
    );
  };

  // RESET ALL DATA TO FRESH DEMO
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TABLES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIER_ORDERS);

    setIngredients(INITIAL_INGREDIENTS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setOrders(INITIAL_ORDERS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setSupplierOrders([]);
    setSelectedTableId('tbl-2');

    addToast('Données Réinitialisées', 'Le restaurant a été réinitialisé avec les données modèles.', 'info');
  };

  return (
    <RestaurantContext.Provider
      value={{
        ingredients,
        menuItems,
        tables,
        orders,
        stockMovements,
        supplierOrders,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        selectedTableId,
        setSelectedTableId,
        mobileViewMode,
        setMobileViewMode,
        soundEnabled,
        setSoundEnabled,
        toasts,
        removeToast,
        addToast,

        occupyTable,
        setTableStatus,
        releaseTable,

        getActiveOrderByTableId,
        getOrderById,
        addItemToOrder,
        removeItemFromOrder,
        updateOrderItemQty,
        sendOrderToKitchen,
        updateOrderItemStatus,
        markOrderAllItemsReady,
        markOrderServed,
        checkoutAndPayOrder,

        restockIngredient,
        declareStockLoss,
        adjustStockDirectly,
        createIngredient,
        updateIngredient,
        deleteIngredient,
        generateSupplierOrder,
        markSupplierOrderReceived,

        createMenuItem,
        updateMenuItem,
        toggleMenuItemStatus,
        calculateDishMaxPortions,
        calculateDishCost,

        resetDemoData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
