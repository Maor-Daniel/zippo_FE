import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './firebase';

async function testFirebaseCollections() {
  try {
    console.log('Testing Firebase collections...');
    
    // Test Products collection
    console.log('\n=== Testing Products collection ===');
    const productsQuery = query(collection(db, 'Products'), limit(3));
    const productsSnapshot = await getDocs(productsQuery);
    
    console.log(`Found ${productsSnapshot.size} documents in Products collection`);
    productsSnapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
    });
    
    // Test if there are other collection names
    console.log('\n=== Testing lowercase products collection ===');
    const productsLowerQuery = query(collection(db, 'products'), limit(3));
    const productsLowerSnapshot = await getDocs(productsLowerQuery);
    
    console.log(`Found ${productsLowerSnapshot.size} documents in products collection`);
    productsLowerSnapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', JSON.stringify(doc.data(), null, 2));
    });
    
  } catch (error) {
    console.error('Error testing Firebase:', error);
  }
}

testFirebase();