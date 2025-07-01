import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { IStorage } from './storage';
import { 
  type User, type InsertUser,
  type ShoppingList, type InsertShoppingList,
  type ListItem, type InsertListItem,
  type Store, type InsertStore,
  type Product, type InsertProduct,
  type Price, type InsertPrice,
  type PriceAlert, type InsertPriceAlert,
  type PriceHistory, type InsertPriceHistory,
  type UserPreferredStore, type InsertUserPreferredStore
} from "@shared/schema";

export class FirebaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const docRef = doc(db, 'users', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id } as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: parseInt(doc.id) } as User;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), id: parseInt(doc.id) } as User;
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: new Date()
    });
    const id = parseInt(docRef.id);
    return { ...user, id, createdAt: new Date() } as User;
  }

  async updateUserLocation(userId: number, location: string, maxDistance: number): Promise<User | undefined> {
    const docRef = doc(db, 'users', userId.toString());
    await updateDoc(docRef, { location, maxDistance });
    return this.getUser(userId);
  }

  // Shopping list operations
  async getShoppingLists(userId: number): Promise<ShoppingList[]> {
    const q = query(
      collection(db, 'shoppingLists'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const lists = querySnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1, // Use sequential IDs starting from 1
        name: data.name,
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }) as ShoppingList[];
    
    // Sort by updatedAt in memory to avoid requiring composite index
    return lists.sort((a, b) => {
      const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bDate - aDate; // desc order
    });
  }

  async getShoppingList(id: number): Promise<ShoppingList | undefined> {
    const docRef = doc(db, 'shoppingLists', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id } as ShoppingList : undefined;
  }

  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    const docRef = await addDoc(collection(db, 'shoppingLists'), {
      ...list,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const id = parseInt(docRef.id);
    return { ...list, id, createdAt: new Date(), updatedAt: new Date() } as ShoppingList;
  }

  async updateShoppingList(id: number, name: string): Promise<ShoppingList | undefined> {
    const docRef = doc(db, 'shoppingLists', id.toString());
    await updateDoc(docRef, { name, updatedAt: new Date() });
    return this.getShoppingList(id);
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    try {
      // Delete all items in the list first
      const itemsQuery = query(collection(db, 'listItems'), where('listId', '==', id));
      const itemsSnapshot = await getDocs(itemsQuery);
      await Promise.all(itemsSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      
      // Delete the list
      await deleteDoc(doc(db, 'shoppingLists', id.toString()));
      return true;
    } catch (error) {
      return false;
    }
  }

  // List item operations
  async getListItems(listId: number): Promise<ListItem[]> {
    const q = query(collection(db, 'listItems'), where('listId', '==', listId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as ListItem[];
  }

  async addListItem(item: InsertListItem): Promise<ListItem> {
    const docRef = await addDoc(collection(db, 'listItems'), {
      ...item,
      createdAt: new Date()
    });
    const id = parseInt(docRef.id);
    
    // Update shopping list timestamp
    if (item.listId) {
      const listRef = doc(db, 'shoppingLists', item.listId.toString());
      await updateDoc(listRef, { updatedAt: new Date() });
    }
    
    return { ...item, id, createdAt: new Date() } as ListItem;
  }

  async updateListItem(id: number, productName: string, quantity: number, checked: boolean): Promise<ListItem | undefined> {
    const docRef = doc(db, 'listItems', id.toString());
    await updateDoc(docRef, { productName, quantity, checked });
    
    const updatedItem = await this.getListItem(id);
    if (updatedItem && updatedItem.listId) {
      const listRef = doc(db, 'shoppingLists', updatedItem.listId.toString());
      await updateDoc(listRef, { updatedAt: new Date() });
    }
    
    return updatedItem;
  }

  private async getListItem(id: number): Promise<ListItem | undefined> {
    const docRef = doc(db, 'listItems', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id } as ListItem : undefined;
  }

  async deleteListItem(id: number): Promise<boolean> {
    try {
      const item = await this.getListItem(id);
      await deleteDoc(doc(db, 'listItems', id.toString()));
      
      if (item && item.listId) {
        const listRef = doc(db, 'shoppingLists', item.listId.toString());
        await updateDoc(listRef, { updatedAt: new Date() });
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Store operations
  async getStores(): Promise<Store[]> {
    const querySnapshot = await getDocs(collection(db, 'stores'));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as Store[];
  }

  async getStoresByDistance(maxDistance: number): Promise<Store[]> {
    const q = query(
      collection(db, 'stores'),
      where('distance', '<=', maxDistance),
      orderBy('distance')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as Store[];
  }

  async getStore(id: number): Promise<Store | undefined> {
    const docRef = doc(db, 'stores', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id } as Store : undefined;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const docRef = await addDoc(collection(db, 'stores'), store);
    const id = parseInt(docRef.id);
    return { ...store, id } as Store;
  }

  // Product operations - using your existing Products collection
  async getProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, 'Products'));
    const productMap = new Map<string, Product>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const productName = data.name;
      
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          id: parseInt(doc.id) || 0,
          name: productName,
          category: data.category || null,
          barcode: data.barcode || null
        });
      }
    });
    
    return Array.from(productMap.values());
  }

  async searchProducts(queryStr: string): Promise<Product[]> {
    if (!queryStr) {
      return this.getProducts();
    }
    
    const querySnapshot = await getDocs(collection(db, 'Products'));
    const productMap = new Map<string, Product>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const productName = data.name;
      
      if (productName && productName.toLowerCase().includes(queryStr.toLowerCase())) {
        if (!productMap.has(productName)) {
          productMap.set(productName, {
            id: parseInt(doc.id) || 0,
            name: productName,
            category: data.category || null,
            barcode: data.barcode || null
          });
        }
      }
    });
    
    return Array.from(productMap.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const q = query(collection(db, 'Products'), where('id', '==', id), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: data.id || parseInt(doc.id),
        name: data.name,
        category: data.category || null,
        barcode: data.barcode || null
      } as Product;
    }
    return undefined;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const q = query(collection(db, 'Products'), where('barcode', '==', barcode), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: data.id || parseInt(doc.id),
        name: data.name,
        category: data.category || null,
        barcode: data.barcode || null
      } as Product;
    }
    return undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const docRef = await addDoc(collection(db, 'Products'), product);
    const id = parseInt(docRef.id);
    return { ...product, id } as Product;
  }

  // Price operations - using Products collection
  async getPrices(storeId: number): Promise<Price[]> {
    const q = query(collection(db, 'Products'), where('store_id', '==', storeId.toString()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id || parseInt(doc.id),
        storeId: parseInt(data.store_id),
        productName: data.name,
        price: data.price.toString(),
        isOnSale: data.isOnSale || false,
        updatedAt: data.updatedAt || new Date()
      };
    }) as Price[];
  }

  async getPricesByProductName(productName: string): Promise<Price[]> {
    try {
      let q;
      if (productName && productName.trim() !== '') {
        // Search for specific product
        q = query(collection(db, 'Products'), where('name', '==', productName));
      } else {
        // Get all products
        q = query(collection(db, 'Products'));
      }
      
      const querySnapshot = await getDocs(q);
      console.log(`Firebase query returned ${querySnapshot.size} documents`);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Product data:', data);
        
        // Handle different possible data structures
        const storeId = data.store_id || data.storeId || 1;
        const price = data.price || data.Price || 0;
        
        return {
          id: parseInt(doc.id) || Math.random(),
          storeId: typeof storeId === 'string' ? parseInt(storeId) : storeId,
          productName: data.name || data.Name || 'Unknown Product',
          price: price.toString(),
          isOnSale: data.isOnSale || data.on_sale || false,
          updatedAt: data.updatedAt || data.updated_at || new Date()
        };
      }) as Price[];
    } catch (error) {
      console.error('Error in getPricesByProductName:', error);
      return [];
    }
  }

  async getPrice(storeId: number, productName: string): Promise<Price | undefined> {
    const q = query(
      collection(db, 'Products'), 
      where('store_id', '==', storeId.toString()),
      where('name', '==', productName),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: data.id || parseInt(doc.id),
        storeId: parseInt(data.store_id),
        productName: data.name,
        price: data.price.toString(),
        isOnSale: data.isOnSale || false,
        updatedAt: data.updatedAt || new Date()
      } as Price;
    }
    return undefined;
  }

  async createPrice(price: InsertPrice): Promise<Price> {
    const docRef = await addDoc(collection(db, 'Products'), {
      name: price.productName,
      store_id: price.storeId?.toString(),
      price: parseFloat(price.price),
      isOnSale: price.isOnSale || false,
      updatedAt: new Date()
    });
    const id = parseInt(docRef.id);
    
    return { 
      id, 
      storeId: price.storeId || null,
      productName: price.productName,
      price: price.price,
      isOnSale: price.isOnSale || false,
      updatedAt: new Date() 
    } as Price;
  }

  async updatePrice(id: number, price: number, isOnSale: boolean): Promise<Price | undefined> {
    const q = query(collection(db, 'Products'), where('id', '==', id), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        price: price,
        isOnSale: isOnSale,
        updatedAt: new Date()
      });
      
      const data = querySnapshot.docs[0].data();
      return {
        id: data.id || parseInt(querySnapshot.docs[0].id),
        storeId: parseInt(data.store_id),
        productName: data.name,
        price: price.toString(),
        isOnSale: isOnSale,
        updatedAt: new Date()
      } as Price;
    }
    return undefined;
  }

  // Price alert operations
  async getPriceAlerts(userId: number): Promise<PriceAlert[]> {
    const q = query(collection(db, 'priceAlerts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as PriceAlert[];
  }

  async createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlert> {
    const docRef = await addDoc(collection(db, 'priceAlerts'), {
      ...alert,
      createdAt: new Date()
    });
    const id = parseInt(docRef.id);
    return { ...alert, id, createdAt: new Date() } as PriceAlert;
  }

  async deletePriceAlert(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'priceAlerts', id.toString()));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Price history operations
  async getPriceHistory(storeId: number, productName: string): Promise<PriceHistory[]> {
    const q = query(
      collection(db, 'priceHistory'),
      where('storeId', '==', storeId),
      where('productName', '==', productName),
      orderBy('date')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as PriceHistory[];
  }

  async createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const docRef = await addDoc(collection(db, 'priceHistory'), {
      ...history,
      date: new Date()
    });
    const id = parseInt(docRef.id);
    return { ...history, id, date: new Date() } as PriceHistory;
  }

  // User preferred stores operations
  async getUserPreferredStores(userId: number): Promise<UserPreferredStore[]> {
    const q = query(collection(db, 'userPreferredStores'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: parseInt(doc.id)
    })) as UserPreferredStore[];
  }

  async createUserPreferredStore(preferred: InsertUserPreferredStore): Promise<UserPreferredStore> {
    const docRef = await addDoc(collection(db, 'userPreferredStores'), preferred);
    const id = parseInt(docRef.id);
    return { ...preferred, id } as UserPreferredStore;
  }

  async updateUserPreferredStore(id: number, isFavorite: boolean): Promise<UserPreferredStore | undefined> {
    const docRef = doc(db, 'userPreferredStores', id.toString());
    await updateDoc(docRef, { isFavorite });
    
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { ...docSnap.data(), id } as UserPreferredStore : undefined;
  }

  async deleteUserPreferredStore(id: number): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'userPreferredStores', id.toString()));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Comparison operations
  async compareProductPrices(productName: string): Promise<Price[]> {
    return await this.getPricesByProductName(productName);
  }

  async compareShoppingList(listItems: ListItem[], maxDistance: number): Promise<any> {
    const nearbyStores = await this.getStoresByDistance(maxDistance);
    
    const result = await Promise.all(
      nearbyStores.map(async (store) => {
        let totalPrice = 0;
        let savings = 0;
        const priceDetails = [];
        
        for (const item of listItems) {
          const price = await this.getPrice(store.id, item.productName);
          const itemQuantity = item.quantity || 1;
          
          if (price) {
            const itemTotal = Number(price.price) * itemQuantity;
            totalPrice += itemTotal;
            
            const saving = price.isOnSale ? itemTotal * 0.1 : 0;
            savings += saving;
            
            priceDetails.push({
              productName: item.productName,
              quantity: itemQuantity,
              price: Number(price.price),
              total: itemTotal,
              isOnSale: price.isOnSale,
            });
          } else {
            priceDetails.push({
              productName: item.productName,
              quantity: itemQuantity,
              price: 0,
              total: 0,
              isOnSale: false,
              notAvailable: true,
            });
          }
        }
        
        return {
          storeId: store.id,
          name: store.name,
          chain: store.chain,
          distance: Number(store.distance || 0),
          totalPrice,
          savings,
          priceDetails,
        };
      })
    );
    
    return result.sort((a, b) => a.totalPrice - b.totalPrice);
  }
}