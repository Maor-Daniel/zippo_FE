import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './firebase';

async function debugFirebaseCollections() {
  try {
    console.log('=== Firebase Debug ===');
    
    // Check Products collection (capitalized)
    const productsRef = collection(db, 'Products');
    const productsSnapshot = await getDocs(query(productsRef, limit(5)));
    console.log(`Products collection: ${productsSnapshot.size} documents`);
    
    if (productsSnapshot.size > 0) {
      productsSnapshot.forEach((doc, index) => {
        console.log(`Product ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    }
    
    // Check lowercase products collection
    const productsLowerRef = collection(db, 'products');
    const productsLowerSnapshot = await getDocs(query(productsLowerRef, limit(5)));
    console.log(`products collection: ${productsLowerSnapshot.size} documents`);
    
    if (productsLowerSnapshot.size > 0) {
      productsLowerSnapshot.forEach((doc, index) => {
        console.log(`product ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    }
    
    console.log('=== Debug Complete ===');
  } catch (error) {
    console.error('Firebase debug error:', error);
  }
}

debugFirebaseCollections();