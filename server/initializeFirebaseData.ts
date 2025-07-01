import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

// Sample data for your Zolpo app
const sampleStores = [
  {
    name: "Fresh Market Downtown",
    chain: "Fresh Market",
    address: "123 Main St",
    city: "Downtown",
    state: "CA",
    zipCode: "90210",
    latitude: "34.0522",
    longitude: "-118.2437",
    distance: 2.5
  },
  {
    name: "SuperSave Grocery",
    chain: "SuperSave",
    address: "456 Oak Ave",
    city: "Midtown",
    state: "CA",
    zipCode: "90211",
    latitude: "34.0622",
    longitude: "-118.2537",
    distance: 1.8
  },
  {
    name: "GreenLeaf Organic",
    chain: "GreenLeaf",
    address: "789 Pine St",
    city: "Uptown",
    state: "CA",
    zipCode: "90212",
    latitude: "34.0722",
    longitude: "-118.2637",
    distance: 3.2
  }
];

const sampleProducts = [
  { name: "Bananas", category: "fruits", barcode: "123456789" },
  { name: "Apples - Gala", category: "fruits", barcode: "123456790" },
  { name: "Oranges", category: "fruits", barcode: "123456791" },
  { name: "Strawberries", category: "fruits", barcode: "123456792" },
  { name: "Carrots", category: "vegetables", barcode: "123456793" },
  { name: "Broccoli", category: "vegetables", barcode: "123456794" },
  { name: "Spinach", category: "vegetables", barcode: "123456795" },
  { name: "Tomatoes", category: "vegetables", barcode: "123456796" },
  { name: "Chicken Breast", category: "meat", barcode: "123456797" },
  { name: "Ground Beef", category: "meat", barcode: "123456798" },
  { name: "Salmon Fillet", category: "meat", barcode: "123456799" },
  { name: "Milk - 2%", category: "dairy", barcode: "123456800" },
  { name: "Eggs - Dozen", category: "dairy", barcode: "123456801" },
  { name: "Cheddar Cheese", category: "dairy", barcode: "123456802" },
  { name: "Bread - Whole Wheat", category: "bakery", barcode: "123456803" },
  { name: "Bagels", category: "bakery", barcode: "123456804" }
];

const generatePricesForStores = (storeIds: string[], products: any[]) => {
  const prices = [];
  
  storeIds.forEach((storeId, storeIndex) => {
    products.forEach(product => {
      // Generate realistic prices with some variation between stores
      let basePrice = getBasePrice(product.name);
      let variation = (storeIndex * 0.1) + (Math.random() * 0.5 - 0.25);
      let finalPrice = (basePrice + variation).toFixed(2);
      
      prices.push({
        storeId: parseInt(storeId),
        productName: product.name,
        price: finalPrice,
        isOnSale: Math.random() > 0.8, // 20% chance of being on sale
        updatedAt: new Date()
      });
    });
  });
  
  return prices;
};

const getBasePrice = (productName: string): number => {
  const priceMap: { [key: string]: number } = {
    "Bananas": 1.29,
    "Apples - Gala": 2.99,
    "Oranges": 3.49,
    "Strawberries": 4.99,
    "Carrots": 1.49,
    "Broccoli": 2.99,
    "Spinach": 3.99,
    "Tomatoes": 2.49,
    "Chicken Breast": 8.99,
    "Ground Beef": 6.99,
    "Salmon Fillet": 12.99,
    "Milk - 2%": 3.49,
    "Eggs - Dozen": 2.99,
    "Cheddar Cheese": 4.99,
    "Bread - Whole Wheat": 2.49,
    "Bagels": 3.99
  };
  
  return priceMap[productName] || 2.99;
};

export async function initializeFirebaseData() {
  try {
    console.log('Checking if data already exists...');
    
    // Check if stores already exist
    const storesQuery = query(collection(db, 'stores'), limit(1));
    const storesSnapshot = await getDocs(storesQuery);
    
    if (!storesSnapshot.empty) {
      console.log('Data already exists, skipping initialization');
      return;
    }
    
    console.log('Initializing Firebase with sample data...');
    
    // Add stores
    const storeIds: string[] = [];
    for (const store of sampleStores) {
      const docRef = await addDoc(collection(db, 'stores'), store);
      storeIds.push(docRef.id);
      console.log(`Added store: ${store.name}`);
    }
    
    // Add products
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
      console.log(`Added product: ${product.name}`);
    }
    
    // Add prices
    const prices = generatePricesForStores(storeIds, sampleProducts);
    for (const price of prices) {
      await addDoc(collection(db, 'prices'), price);
    }
    console.log(`Added ${prices.length} price entries`);
    
    console.log('Firebase initialization complete!');
    
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
  }
}