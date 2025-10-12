const { Redis } = require("ioredis");
const { Client } = require("pg");

// Database cleanup script
class DatabaseCleanup {
  constructor() {
    this.redis = null;
    this.pgClient = null;
  }

  // Initialize Redis connection
  async initRedis() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || "",
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });

      await this.redis.connect();
      console.log("✅ Redis connected successfully");
    } catch (error) {
      console.error("❌ Redis connection failed:", error.message);
      throw error;
    }
  }

  // Initialize PostgreSQL connection
  async initPostgreSQL() {
    try {
      this.pgClient = new Client({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "web_scraper",
      });

      await this.pgClient.connect();
      console.log("✅ PostgreSQL connected successfully");
    } catch (error) {
      console.error("❌ PostgreSQL connection failed:", error.message);
      throw error;
    }
  }

  // Clean Redis data
  async cleanRedis() {
    try {
      console.log("\n🧹 Cleaning Redis data...");

      // Get all keys
      const keys = await this.redis.keys("*");
      console.log(`📊 Found ${keys.length} keys in Redis`);

      if (keys.length > 0) {
        // Delete all keys
        await this.redis.del(...keys);
        console.log("✅ All Redis keys deleted");
      } else {
        console.log("ℹ️  No keys found in Redis");
      }

      // Clean BullMQ specific keys
      const bullKeys = await this.redis.keys("bull:*");
      if (bullKeys.length > 0) {
        await this.redis.del(...bullKeys);
        console.log(`✅ Deleted ${bullKeys.length} BullMQ keys`);
      }

      // Flush all databases
      await this.redis.flushall();
      console.log("✅ Redis flushed all databases");
    } catch (error) {
      console.error("❌ Error cleaning Redis:", error.message);
      throw error;
    }
  }

  // Clean PostgreSQL data
  async cleanPostgreSQL() {
    try {
      console.log("\n🧹 Cleaning PostgreSQL data...");

      // Get table counts before cleanup
      const beforeCounts = await this.getTableCounts();
      console.log("📊 Data before cleanup:");
      Object.entries(beforeCounts).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} records`);
      });

      // Disable foreign key checks temporarily
      await this.pgClient.query("SET session_replication_role = replica;");

      // Clean tables in correct order (respecting foreign keys)
      const tables = ["scraped_assets", "scraped_pages"];

      for (const table of tables) {
        const result = await this.pgClient.query(`DELETE FROM ${table}`);
        console.log(`✅ Deleted ${result.rowCount} records from ${table}`);
      }

      // Re-enable foreign key checks
      await this.pgClient.query("SET session_replication_role = DEFAULT;");

      // Reset sequences
      await this.pgClient.query(
        "ALTER SEQUENCE scraped_pages_id_seq RESTART WITH 1;"
      );
      await this.pgClient.query(
        "ALTER SEQUENCE scraped_assets_id_seq RESTART WITH 1;"
      );
      console.log("✅ Reset auto-increment sequences");

      // Get table counts after cleanup
      const afterCounts = await this.getTableCounts();
      console.log("\n📊 Data after cleanup:");
      Object.entries(afterCounts).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} records`);
      });
    } catch (error) {
      console.error("❌ Error cleaning PostgreSQL:", error.message);
      throw error;
    }
  }

  // Get table record counts
  async getTableCounts() {
    const tables = ["scraped_pages", "scraped_assets"];
    const counts = {};

    for (const table of tables) {
      try {
        const result = await this.pgClient.query(
          `SELECT COUNT(*) FROM ${table}`
        );
        counts[table] = parseInt(result.rows[0].count);
      } catch (error) {
        counts[table] = 0;
      }
    }

    return counts;
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      console.log("\n📊 Database Statistics:");

      // PostgreSQL stats
      const pgStats = await this.pgClient.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `);

      console.log("📈 PostgreSQL Table Statistics:");
      pgStats.rows.forEach((row) => {
        console.log(
          `   ${row.tablename}: ${row.inserts} inserts, ${row.updates} updates, ${row.deletes} deletes`
        );
      });

      // Redis stats
      const redisInfo = await this.redis.info("memory");
      const memoryMatch = redisInfo.match(/used_memory_human:([^\r\n]+)/);
      if (memoryMatch) {
        console.log(`📈 Redis Memory Usage: ${memoryMatch[1]}`);
      }
    } catch (error) {
      console.error("❌ Error getting database stats:", error.message);
    }
  }

  // Main cleanup function
  async cleanup() {
    console.log("🧹 DATABASE CLEANUP SCRIPT");
    console.log("=".repeat(50));

    try {
      // Initialize connections
      await this.initRedis();
      await this.initPostgreSQL();

      // Get initial stats
      await this.getDatabaseStats();

      // Clean databases
      await this.cleanRedis();
      await this.cleanPostgreSQL();

      // Get final stats
      await this.getDatabaseStats();

      console.log("\n✅ CLEANUP COMPLETED SUCCESSFULLY");
      console.log("=".repeat(50));
      console.log("🎉 All data has been removed from:");
      console.log("   • Redis (all keys and BullMQ queues)");
      console.log("   • PostgreSQL (all tables and sequences)");
      console.log("\n💡 You can now start fresh with clean databases!");
    } catch (error) {
      console.error("\n❌ CLEANUP FAILED:", error.message);
      console.log("💡 Please check your database connections and try again.");
      process.exit(1);
    } finally {
      // Close connections
      await this.closeConnections();
    }
  }

  // Close all connections
  async closeConnections() {
    try {
      if (this.redis) {
        await this.redis.quit();
        console.log("🔌 Redis connection closed");
      }

      if (this.pgClient) {
        await this.pgClient.end();
        console.log("🔌 PostgreSQL connection closed");
      }
    } catch (error) {
      console.error("❌ Error closing connections:", error.message);
    }
  }
}

// Run cleanup
const cleanup = new DatabaseCleanup();
cleanup.cleanup().catch(console.error);
