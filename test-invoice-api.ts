#!/usr/bin/env npx tsx

import { db } from './lib/db/drizzle';
import { invoices } from './lib/db/schema-billing';

async function testInvoiceAPI() {
  console.log('🔍 Testing Invoice API and Database Connection...\n');

  // 1. Check database directly
  console.log('📊 Checking database directly:');
  const invoiceCount = await db.select().from(invoices);
  console.log(`   ✅ Found ${invoiceCount.length} invoices in database\n`);

  // 2. Show first 3 invoices sample
  if (invoiceCount.length > 0) {
    console.log('📋 Sample invoices from database:');
    invoiceCount.slice(0, 3).forEach((inv, i) => {
      console.log(`   ${i + 1}. ${inv.invoiceNumber} - ${inv.status} - $${inv.total}`);
    });
    console.log('');
  }

  // 3. Test API endpoint (requires authentication)
  console.log('🔐 Testing API endpoint:');
  console.log('   Note: API requires system admin authentication');
  console.log('   To test: Login as admin@admin.com / admin123');
  console.log('   Then visit: http://localhost:3001/admin/billing/invoices\n');

  // 4. Show authentication status
  console.log('🔑 Authentication notes:');
  console.log('   - Regular users cannot access /admin routes');
  console.log('   - System admin login: admin@admin.com / admin123');
  console.log('   - After login, you\'ll be redirected to /admin/dashboard');
  console.log('   - The invoice page will then show all 51 invoices\n');

  // 5. Show quick debug commands
  console.log('🛠️  Quick debug commands:');
  console.log('   1. Check if logged in as admin:');
  console.log('      Open DevTools → Application → Cookies → Look for "session" cookie');
  console.log('   2. Test API directly:');
  console.log('      curl -H "Cookie: session=YOUR_SESSION_COOKIE" http://localhost:3001/api/system-admin/billing/invoices');
  console.log('   3. View database directly:');
  console.log('      pnpm db:studio');

  process.exit(0);
}

testInvoiceAPI().catch(console.error);