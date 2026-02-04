const { Pool } = require('pg');
const mysql = require('mysql2/promise');

// Old PostgreSQL (Neon) connection
const pgPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6n7AFalXsmSy@ep-lucky-forest-ahfa1pys-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

// New MySQL (Freehostia) connection config
const mysqlConfig = {
  host: 'mysql.freehostia.com',
  user: 'essref3_electronics',
  password: 'Smsm@2103',
  database: 'essref3_electronics',
  charset: 'utf8mb4'
};

// Tables in dependency order (tables with no foreign keys first)
const tables = [
  'Setting',
  'FinancialCycle',
  'Supplier',
  'User',
  'Category',
  'Shop',
  'ShopPayoutPreference',
  'ShopPayout',
  'ShopMember',
  'ShopFeatureToggle',
  'ShopSetting',
  'ShopInvitation',
  'ShopAutomationHook',
  'Product',
  'Order',
  'OrderItem',
  'OrderLog',
  'ShopCommissionLedger',
  'Expense',
  'SupplierPayout',
  'Wishlist',
  'CartItem',
  'Review',
  'ReviewLog'
];

// Convert PostgreSQL value to MySQL compatible format
function convertValue(value, columnName) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

async function migrateTable(pgClient, mysqlConn, tableName) {
  console.log(`\n📦 Migrating table: ${tableName}`);
  
  try {
    // Get data from PostgreSQL
    const pgResult = await pgClient.query(`SELECT * FROM "${tableName}"`);
    const rows = pgResult.rows;
    
    if (rows.length === 0) {
      console.log(`   ⏭️  No data in ${tableName}`);
      return 0;
    }
    
    console.log(`   Found ${rows.length} rows`);
    
    // Get column names
    const columns = Object.keys(rows[0]);
    const columnList = columns.map(c => `\`${c}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    
    // Insert each row
    let inserted = 0;
    for (const row of rows) {
      const values = columns.map(col => convertValue(row[col], col));
      
      try {
        await mysqlConn.execute(
          `INSERT INTO \`${tableName}\` (${columnList}) VALUES (${placeholders})`,
          values
        );
        inserted++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`   ⚠️  Skipping duplicate: ${row.id || 'unknown'}`);
        } else {
          console.error(`   ❌ Error inserting row:`, err.message);
          console.error(`   Row data:`, JSON.stringify(row).substring(0, 200));
        }
      }
    }
    
    console.log(`   ✅ Inserted ${inserted}/${rows.length} rows`);
    return inserted;
  } catch (err) {
    console.error(`   ❌ Error migrating ${tableName}:`, err.message);
    return 0;
  }
}

async function migrate() {
  console.log('🚀 Starting data migration from PostgreSQL to MySQL...\n');
  
  let pgClient;
  let mysqlConn;
  
  try {
    // Connect to PostgreSQL
    console.log('📡 Connecting to PostgreSQL (Neon)...');
    pgClient = await pgPool.connect();
    console.log('   ✅ Connected to PostgreSQL');
    
    // Connect to MySQL
    console.log('📡 Connecting to MySQL (Freehostia)...');
    mysqlConn = await mysql.createConnection(mysqlConfig);
    console.log('   ✅ Connected to MySQL');
    
    // Disable foreign key checks for migration
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    let totalMigrated = 0;
    
    // Migrate each table
    for (const table of tables) {
      const count = await migrateTable(pgClient, mysqlConn, table);
      totalMigrated += count;
    }
    
    // Re-enable foreign key checks
    await mysqlConn.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration complete! Total rows migrated: ${totalMigrated}`);
    console.log('='.repeat(50));
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    if (pgClient) pgClient.release();
    if (mysqlConn) await mysqlConn.end();
    await pgPool.end();
  }
}

migrate();
