import { pgTable, text, serial, integer, boolean, numeric, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  location: text("location"),
  maxDistance: integer("max_distance").default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  location: true,
  maxDistance: true,
});

// Shopping list model
export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).pick({
  userId: true,
  name: true,
});

// Shopping list items model
export const listItems = pgTable("list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => shoppingLists.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").default(1),
  checked: boolean("checked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertListItemSchema = createInsertSchema(listItems).pick({
  listId: true,
  productName: true,
  quantity: true,
  checked: true,
});

// Store model
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chain: text("chain").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  distance: numeric("distance", { precision: 10, scale: 1 }),
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  chain: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  latitude: true,
  longitude: true,
  distance: true,
});

// Product model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  barcode: text("barcode"),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  barcode: true,
});

// Price model
export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  productName: text("product_name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isOnSale: boolean("is_on_sale").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPriceSchema = createInsertSchema(prices).pick({
  storeId: true,
  productName: true,
  price: true,
  isOnSale: true,
});

// Price alerts model
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productName: text("product_name").notNull(),
  targetPrice: numeric("target_price", { precision: 10, scale: 2 }).notNull(),
  storeId: integer("store_id").references(() => stores.id),
  emailAlert: boolean("email_alert").default(true),
  pushAlert: boolean("push_alert").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  userId: true,
  productName: true,
  targetPrice: true,
  storeId: true,
  emailAlert: true,
  pushAlert: true,
});

// Price history model
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  productName: text("product_name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).pick({
  storeId: true,
  productName: true,
  price: true,
});

// User preferred stores model
export const userPreferredStores = pgTable("user_preferred_stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  storeId: integer("store_id").references(() => stores.id),
  isFavorite: boolean("is_favorite").default(false),
});

export const insertUserPreferredStoreSchema = createInsertSchema(userPreferredStores).pick({
  userId: true,
  storeId: true,
  isFavorite: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shoppingLists: many(shoppingLists),
  priceAlerts: many(priceAlerts),
  preferredStores: many(userPreferredStores),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one, many }) => ({
  user: one(users, {
    fields: [shoppingLists.userId],
    references: [users.id],
  }),
  items: many(listItems),
}));

export const listItemsRelations = relations(listItems, ({ one }) => ({
  shoppingList: one(shoppingLists, {
    fields: [listItems.listId],
    references: [shoppingLists.id],
  }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  prices: many(prices),
  priceHistory: many(priceHistory),
  preferredByUsers: many(userPreferredStores),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  store: one(stores, {
    fields: [prices.storeId],
    references: [stores.id],
  }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [priceAlerts.storeId],
    references: [stores.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  store: one(stores, {
    fields: [priceHistory.storeId],
    references: [stores.id],
  }),
}));

export const userPreferredStoresRelations = relations(userPreferredStores, ({ one }) => ({
  user: one(users, {
    fields: [userPreferredStores.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [userPreferredStores.storeId],
    references: [stores.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;

export type ListItem = typeof listItems.$inferSelect;
export type InsertListItem = z.infer<typeof insertListItemSchema>;

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Price = typeof prices.$inferSelect;
export type InsertPrice = z.infer<typeof insertPriceSchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export type UserPreferredStore = typeof userPreferredStores.$inferSelect;
export type InsertUserPreferredStore = z.infer<typeof insertUserPreferredStoreSchema>;
