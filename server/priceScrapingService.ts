import * as cron from 'node-cron';
import { priceScraper, ScrapedPrice } from './priceScraper';
import { storage } from './storage';

export class PriceScrapingService {
  private isRunning = false;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    // Initialize the scheduled price scraping
    this.initializeScheduledScraping();
  }

  initializeScheduledScraping(): void {
    // Schedule price scraping every 6 hours
    this.scheduledTask = cron.schedule('0 */6 * * *', async () => {
      if (!this.isRunning) {
        console.log('Starting scheduled price scraping...');
        await this.performScheduledScraping();
      } else {
        console.log('Price scraping already in progress, skipping...');
      }
    }, {
      scheduled: false // Don't start automatically
    });

    console.log('Price scraping service initialized');
  }

  async startScheduledScraping(): Promise<void> {
    if (this.scheduledTask) {
      this.scheduledTask.start();
      console.log('Scheduled price scraping started (every 6 hours)');
    }
  }

  async stopScheduledScraping(): Promise<void> {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      console.log('Scheduled price scraping stopped');
    }
  }

  async performScheduledScraping(): Promise<void> {
    if (this.isRunning) {
      console.log('Price scraping already in progress');
      return;
    }

    this.isRunning = true;

    try {
      console.log('Starting automated price scraping across all stores...');
      
      // Get popular products from our database to scrape
      const popularProducts = await this.getPopularProductsForScraping();
      
      const allScrapedPrices: ScrapedPrice[] = [];
      
      for (const productName of popularProducts) {
        try {
          console.log(`Scraping prices for: ${productName}`);
          
          // Scrape prices from all configured stores
          const scrapedPrices = await priceScraper.scrapeProductPrices(productName);
          
          if (scrapedPrices.length > 0) {
            allScrapedPrices.push(...scrapedPrices);
            console.log(`Found ${scrapedPrices.length} prices for ${productName}`);
          } else {
            console.log(`No prices found for ${productName}`);
          }
          
          // Add delay between product searches to be respectful
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`Error scraping prices for ${productName}:`, error);
        }
      }
      
      // Update all scraped prices in database
      if (allScrapedPrices.length > 0) {
        await priceScraper.updatePricesInDatabase(allScrapedPrices);
        console.log(`Successfully updated ${allScrapedPrices.length} prices in database`);
      }
      
    } catch (error) {
      console.error('Error in scheduled price scraping:', error);
    } finally {
      this.isRunning = false;
      console.log('Scheduled price scraping completed');
    }
  }

  async getPopularProductsForScraping(): Promise<string[]> {
    try {
      // Get unique product names from existing price data
      const allPrices = await storage.getPricesByProductName('');
      const productNames = [...new Set(allPrices.map(price => price.productName))];
      
      // Prioritize common grocery items if no existing data
      const defaultProducts = [
        'חלב',
        'לחם',
        'ביצים',
        'יוגורט',
        'גבינה',
        'עגבניות',
        'מלפפון',
        'בננה',
        'תפוח',
        'עוף',
        'אורז',
        'פסטה',
        'שמן',
        'סוכר',
        'קמח'
      ];
      
      return productNames.length > 0 ? productNames.slice(0, 10) : defaultProducts;
      
    } catch (error) {
      console.error('Error getting popular products:', error);
      return [];
    }
  }

  async scrapeSpecificProduct(productName: string, storeIds?: string[]): Promise<ScrapedPrice[]> {
    try {
      console.log(`Manual scraping requested for: ${productName}`);
      
      const scrapedPrices = await priceScraper.scrapeAndUpdatePrices(productName, storeIds);
      
      console.log(`Manual scraping completed: found ${scrapedPrices.length} prices`);
      return scrapedPrices;
      
    } catch (error) {
      console.error(`Error in manual scraping for ${productName}:`, error);
      throw error;
    }
  }

  async getScrapingStatus(): Promise<{
    isRunning: boolean;
    isScheduled: boolean;
    lastRun?: Date;
    nextRun?: Date;
  }> {
    return {
      isRunning: this.isRunning,
      isScheduled: this.scheduledTask ? this.scheduledTask.running : false,
      lastRun: undefined, // Could be implemented with persistent storage
      nextRun: undefined  // Could be calculated from cron schedule
    };
  }

  async cleanup(): Promise<void> {
    await this.stopScheduledScraping();
    await priceScraper.closeBrowser();
    console.log('Price scraping service cleaned up');
  }
}

export const priceScrapingService = new PriceScrapingService();