import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    console.log('=== Testing Firebase Connection ===');
    
    // Test 1: Check if we can read from Products collection
    console.log('Test 1: Reading from Products collection...');
    const q = query(collection(db, 'Products'), limit(5));
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} existing products`);
    
    // Test 2: Add a test product
    console.log('Test 2: Adding a test product...');
    const testProduct = {
      name: 'Test Product - חלב טסט',
      price: 6.50,
      store_id: '1',
      store_name: 'Test Store',
      quantity: '1L',
      isOnSale: false,
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'Products'), testProduct);
    console.log(`Test product added with ID: ${docRef.id}`);
    
    // Test 3: Read again to verify
    console.log('Test 3: Reading again to verify...');
    const q2 = query(collection(db, 'Products'), limit(10));
    const querySnapshot2 = await getDocs(q2);
    console.log(`Now found ${querySnapshot2.size} products`);
    
    querySnapshot2.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Product ${index + 1}: ${data.name} - ${data.price}`);
    });
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
}