import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertShoppingListSchema, insertListItemSchema, insertPriceAlertSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { addMoreDataToFirebase } from "./addMoreData";
import { priceScrapingService } from "./priceScrapingService";
import { debugProducts } from "./debugProducts";
import { testFirebaseConnection } from "./testFirebaseConnection";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up sessions
  app.use(session({
    secret: process.env.SESSION_SECRET || 'zolpo-price-comparison-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // User routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      // Return a default demo user for open access
      const demoUser = {
        id: 1,
        username: 'demo_user',
        email: 'demo@zolpo.com',
        name: 'Demo User',
        location: 'Tel Aviv',
        maxDistance: 10,
        createdAt: new Date()
      };
      res.json(demoUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/user/location', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const { location, maxDistance } = req.body;
      
      if (!location || !maxDistance) {
        return res.status(400).json({ message: 'Location and maxDistance are required' });
      }
      
      const user = await storage.updateUserLocation(userId, location, maxDistance);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Shopping list routes
  app.get('/api/lists', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      console.log('Fetching shopping lists for user:', userId);
      const lists = await storage.getShoppingLists(userId);
      console.log('Retrieved lists:', lists);
      res.json(lists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/lists', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const listData = insertShoppingListSchema.parse({
        ...req.body,
        userId
      });
      
      const list = await storage.createShoppingList(listData);
      res.status(201).json(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/lists/:id', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID' });
      }
      
      const list = await storage.getShoppingList(listId);
      
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      
      // Get list items
      const items = await storage.getListItems(listId);
      
      res.json({
        ...list,
        items
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/lists/:id', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      const { name } = req.body;
      
      if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID' });
      }
      
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      const list = await storage.getShoppingList(listId);
      
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      
      const updatedList = await storage.updateShoppingList(listId, name);
      res.json(updatedList);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/lists/:id', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID' });
      }
      
      const list = await storage.getShoppingList(listId);
      
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      
      await storage.deleteShoppingList(listId);
      res.json({ message: 'List deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // List item routes
  app.post('/api/lists/:id/items', async (req, res) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID' });
      }
      
      const list = await storage.getShoppingList(listId);
      
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      
      const itemData = insertListItemSchema.parse({
        ...req.body,
        listId
      });
      
      const item = await storage.addListItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/lists/items/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const { productName, quantity, checked } = req.body;
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      // Update item
      const updatedItem = await storage.updateListItem(
        itemId,
        productName,
        quantity,
        checked
      );
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/lists/items/:id', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: 'Invalid item ID' });
      }
      
      await storage.deleteListItem(itemId);
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Store routes
  app.get('/api/stores', async (req, res) => {
    try {
      const maxDistance = req.query.maxDistance ? parseInt(req.query.maxDistance as string) : undefined;
      
      let stores;
      if (maxDistance) {
        stores = await storage.getStoresByDistance(maxDistance);
      } else {
        stores = await storage.getStores();
      }
      
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/stores/:id', async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      
      if (isNaN(storeId)) {
        return res.status(400).json({ message: 'Invalid store ID' });
      }
      
      const store = await storage.getStore(storeId);
      
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Product routes
  app.get('/api/products/search', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      
      if (!query) {
        const products = await storage.getProducts();
        return res.json(products);
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Price routes
  app.get('/api/prices', async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const productName = req.query.productName as string;
      
      if (storeId && productName) {
        const price = await storage.getPrice(storeId, productName);
        
        if (!price) {
          return res.status(404).json({ message: 'Price not found' });
        }
        
        return res.json(price);
      } else if (storeId) {
        const prices = await storage.getPrices(storeId);
        return res.json(prices);
      } else if (productName) {
        const prices = await storage.getPricesByProductName(productName);
        return res.json(prices);
      } else {
        return res.status(400).json({ message: 'storeId or productName parameter is required' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Price history routes
  app.get('/api/price-history', async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const productName = req.query.productName as string;
      
      if (!storeId || !productName) {
        return res.status(400).json({ message: 'storeId and productName parameters are required' });
      }
      
      const history = await storage.getPriceHistory(storeId, productName);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Price alert routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const alertData = insertPriceAlertSchema.parse({
        ...req.body,
        userId
      });
      
      const alert = await storage.createPriceAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/alerts/:id', async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return res.status(400).json({ message: 'Invalid alert ID' });
      }
      
      await storage.deletePriceAlert(alertId);
      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Comparison routes
  app.post('/api/compare', async (req, res) => {
    try {
      const { listItems, maxDistance } = req.body;
      
      if (!listItems || !Array.isArray(listItems)) {
        return res.status(400).json({ message: 'listItems array is required' });
      }
      
      if (!maxDistance) {
        return res.status(400).json({ message: 'maxDistance is required' });
      }
      
      const results = await storage.compareShoppingList(listItems, maxDistance);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // User preferred stores routes
  app.get('/api/preferred-stores', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const preferredStores = await storage.getUserPreferredStores(userId);
      res.json(preferredStores);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/preferred-stores', async (req, res) => {
    try {
      const userId = 1; // Default demo user
      const { storeId, isFavorite } = req.body;
      
      if (!storeId) {
        return res.status(400).json({ message: 'storeId is required' });
      }
      
      // Check if store exists
      const store = await storage.getStore(storeId);
      
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
      
      const preferredStore = await storage.createUserPreferredStore({
        userId,
        storeId,
        isFavorite: isFavorite || false
      });
      
      res.status(201).json(preferredStore);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all products from Firebase Products collection
  app.get('/api/prices/all-products', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      console.log('Fetching all products from Firebase...');
      
      // Get all products from Firebase (which are stored as price entries)
      const allProducts = await storage.getPricesByProductName('');
      console.log(`Retrieved ${allProducts.length} products from Firebase`);
      
      // Filter by search query if provided
      let filteredProducts = allProducts;
      if (query) {
        filteredProducts = allProducts.filter(product => 
          product.productName.toLowerCase().includes(query.toLowerCase())
        );
        console.log(`Filtered to ${filteredProducts.length} products matching "${query}"`);
      }
      
      // Map to the expected format for the frontend
      const formattedProducts = filteredProducts.map((product, index) => ({
        id: product.id || `product-${index}`,
        name: product.productName,
        store_id: product.storeId?.toString() || 'unknown',
        store_name: 'Store', // Default store name
        price: parseFloat(product.price),
        quantity: 500 // Default quantity
      }));
      
      console.log(`Returning ${formattedProducts.length} formatted products to frontend`);
      res.json(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Error fetching products' });
    }
  });

  // Real-time price scraping endpoints
  app.post('/api/scrape/product', async (req, res) => {
    try {
      const { productName, storeIds } = req.body;
      
      if (!productName) {
        return res.status(400).json({ message: 'Product name is required' });
      }
      
      console.log(`Manual price scraping requested for: ${productName}`);
      
      const scrapedPrices = await priceScrapingService.scrapeSpecificProduct(productName, storeIds);
      
      res.json({
        message: `Successfully scraped ${scrapedPrices.length} prices for ${productName}`,
        scrapedPrices,
        count: scrapedPrices.length
      });
      
    } catch (error) {
      console.error('Error in manual price scraping:', error);
      res.status(500).json({ message: 'Error scraping prices', error: error.message });
    }
  });

  app.get('/api/scrape/status', async (req, res) => {
    try {
      const status = await priceScrapingService.getScrapingStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting scraping status:', error);
      res.status(500).json({ message: 'Error getting status' });
    }
  });

  app.post('/api/scrape/start-scheduled', async (req, res) => {
    try {
      await priceScrapingService.startScheduledScraping();
      res.json({ message: 'Scheduled price scraping started' });
    } catch (error) {
      console.error('Error starting scheduled scraping:', error);
      res.status(500).json({ message: 'Error starting scheduled scraping' });
    }
  });

  app.post('/api/scrape/stop-scheduled', async (req, res) => {
    try {
      await priceScrapingService.stopScheduledScraping();
      res.json({ message: 'Scheduled price scraping stopped' });
    } catch (error) {
      console.error('Error stopping scheduled scraping:', error);
      res.status(500).json({ message: 'Error stopping scheduled scraping' });
    }
  });

  app.post('/api/scrape/run-now', async (req, res) => {
    try {
      // Trigger immediate scraping run
      priceScrapingService.performScheduledScraping().catch(error => {
        console.error('Background scraping error:', error);
      });
      
      res.json({ message: 'Price scraping started in background' });
    } catch (error) {
      console.error('Error starting immediate scraping:', error);
      res.status(500).json({ message: 'Error starting scraping' });
    }
  });

  // Test Firebase connection endpoint
  app.get('/api/test/firebase', async (req, res) => {
    try {
      const success = await testFirebaseConnection();
      res.json({ message: success ? 'Firebase connection successful' : 'Firebase connection failed' });
    } catch (error) {
      console.error('Error testing Firebase:', error);
      res.status(500).json({ message: 'Firebase test failed' });
    }
  });

  // Debug endpoint to check Firebase data structure
  app.get('/api/debug/products', async (req, res) => {
    try {
      await debugProducts();
      res.json({ message: 'Debug output sent to console' });
    } catch (error) {
      console.error('Error debugging products:', error);
      res.status(500).json({ message: 'Error debugging products' });
    }
  });

  // Admin endpoint to populate Firebase with comprehensive grocery data
  app.post('/api/admin/populate-data', async (req, res) => {
    try {
      await addMoreDataToFirebase();
      res.json({ message: 'Successfully added comprehensive grocery data to Firebase!' });
    } catch (error) {
      console.error('Error populating data:', error);
      res.status(500).json({ message: 'Error adding data to Firebase', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
