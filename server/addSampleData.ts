import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const sampleProducts = [
  // Dairy products
  { name: 'חלב טרה 3% 1 ליטר', price: 6.90, store_id: '1', store_name: 'שופרסל', quantity: '1L', category: 'חלב ומוצרי חלב' },
  { name: 'חלב טרה 3% 1 ליטר', price: 6.50, store_id: '2', store_name: 'רמי לוי', quantity: '1L', category: 'חלב ומוצרי חלב' },
  { name: 'חלב טרה 3% 1 ליטר', price: 7.20, store_id: '3', store_name: 'מגה', quantity: '1L', category: 'חלב ומוצרי חלב' },
  
  { name: 'גבינה צהובה תנובה 250 גרם', price: 22.90, store_id: '1', store_name: 'שופרסל', quantity: '250g', category: 'חלב ומוצרי חלב' },
  { name: 'גבינה צהובה תנובה 250 גרם', price: 21.50, store_id: '2', store_name: 'רמי לוי', quantity: '250g', category: 'חלב ומוצרי חלב' },
  { name: 'גבינה צהובה תנובה 250 גרם', price: 23.90, store_id: '3', store_name: 'מגה', quantity: '250g', category: 'חלב ומוצרי חלב' },
  
  // Bread and baked goods
  { name: 'לחם פרוס בריאות 500 גרם', price: 5.90, store_id: '1', store_name: 'שופרסל', quantity: '500g', category: 'לחם ומוצרי מאפה' },
  { name: 'לחם פרוס בריאות 500 גרם', price: 5.50, store_id: '2', store_name: 'רמי לוי', quantity: '500g', category: 'לחם ומוצרי מאפה' },
  { name: 'לחם פרוס בריאות 500 גרם', price: 6.20, store_id: '3', store_name: 'מגה', quantity: '500g', category: 'לחם ומוצרי מאפה' },
  
  // Fruits and vegetables
  { name: 'בננות קילו', price: 8.90, store_id: '1', store_name: 'שופרסל', quantity: '1kg', category: 'פירות וירקות' },
  { name: 'בננות קילו', price: 7.90, store_id: '2', store_name: 'רמי לוי', quantity: '1kg', category: 'פירות וירקות' },
  { name: 'בננות קילו', price: 9.50, store_id: '3', store_name: 'מגה', quantity: '1kg', category: 'פירות וירקות' },
  
  { name: 'עגבניות קילו', price: 12.90, store_id: '1', store_name: 'שופרסל', quantity: '1kg', category: 'פירות וירקות' },
  { name: 'עגבניות קילו', price: 11.50, store_id: '2', store_name: 'רמי לוי', quantity: '1kg', category: 'פירות וירקות' },
  { name: 'עגבניות קילו', price: 13.90, store_id: '3', store_name: 'מגה', quantity: '1kg', category: 'פירות וירקות' },
  
  // Meat and fish
  { name: 'עוף טרי שלם קילו', price: 24.90, store_id: '1', store_name: 'שופרסל', quantity: '1kg', category: 'בשר ודגים' },
  { name: 'עוף טרי שלם קילו', price: 22.90, store_id: '2', store_name: 'רמי לוי', quantity: '1kg', category: 'בשר ודגים' },
  { name: 'עוף טרי שלם קילו', price: 26.50, store_id: '3', store_name: 'מגה', quantity: '1kg', category: 'בשר ודגים' },
  
  // Pantry items
  { name: 'אורז יסמין 1 קילו', price: 12.90, store_id: '1', store_name: 'שופרסל', quantity: '1kg', category: 'מוצרי מזווה' },
  { name: 'אורז יסמין 1 קילו', price: 11.50, store_id: '2', store_name: 'רמי לוי', quantity: '1kg', category: 'מוצרי מזווה' },
  { name: 'אורז יסמין 1 קילו', price: 13.20, store_id: '3', store_name: 'מגה', quantity: '1kg', category: 'מוצרי מזווה' },
  
  { name: 'פסטה ספגטי ברילה 500 גרם', price: 8.90, store_id: '1', store_name: 'שופרסל', quantity: '500g', category: 'מוצרי מזווה' },
  { name: 'פסטה ספגטי ברילה 500 גרם', price: 7.90, store_id: '2', store_name: 'רמי לוי', quantity: '500g', category: 'מוצרי מזווה' },
  { name: 'פסטה ספגטי ברילה 500 גרם', price: 9.50, store_id: '3', store_name: 'מגה', quantity: '500g', category: 'מוצרי מזווה' },
  
  // Beverages
  { name: 'קוקה קולה 1.5 ליטר', price: 6.90, store_id: '1', store_name: 'שופרסל', quantity: '1.5L', category: 'משקאות' },
  { name: 'קוקה קולה 1.5 ליטר', price: 5.90, store_id: '2', store_name: 'רמי לוי', quantity: '1.5L', category: 'משקאות' },
  { name: 'קוקה קולה 1.5 ליטר', price: 7.50, store_id: '3', store_name: 'מגה', quantity: '1.5L', category: 'משקאות' },
  
  // Cleaning products
  { name: 'אבקת כביסה אריאל 3 קילו', price: 45.90, store_id: '1', store_name: 'שופרסל', quantity: '3kg', category: 'מוצרי ניקיון' },
  { name: 'אבקת כביסה אריאל 3 קילו', price: 42.50, store_id: '2', store_name: 'רמי לוי', quantity: '3kg', category: 'מוצרי ניקיון' },
  { name: 'אבקת כביסה אריאל 3 קילו', price: 48.90, store_id: '3', store_name: 'מגה', quantity: '3kg', category: 'מוצרי ניקיון' }
];

export async function addSampleData() {
  try {
    console.log('🛒 Adding sample grocery data to Firebase...');
    
    for (const product of sampleProducts) {
      const productData = {
        ...product,
        isOnSale: Math.random() > 0.8, // 20% chance of being on sale
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, 'Products'), productData);
    }
    
    console.log(`✅ Successfully added ${sampleProducts.length} sample products to Firebase`);
    console.log('📊 Products include: dairy, bread, fruits, vegetables, meat, pantry items, beverages, and cleaning products');
    console.log('🏪 Data covers 3 stores: שופרסל, רמי לוי, מגה');
    
    return true;
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    return false;
  }
}

// Run the function immediately
addSampleData();