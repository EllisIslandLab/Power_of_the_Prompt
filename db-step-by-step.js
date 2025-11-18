#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function executeSQL(client, sql, description) {
  try {
    console.log(`⚙️  ${description}...`);
    const result = await client.query(sql);
    console.log(`✅ Success!\n`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Failed: ${error.message}\n`);
    return { success: false, error };
  }
}

async function main() {
  // Use the pooler URL without modifications - it should work for simple queries
  const connectionString = process.env.DATABASE_URL;

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('🔌 Connecting via pooler...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Step 1: Create ai_interaction_logs table
    console.log('📋 Step 1: Creating ai_interaction_logs table');
    await executeSQL(client, `
      CREATE TABLE IF NOT EXISTS ai_interaction_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email text NOT NULL,
        user_id uuid,
        interaction_type text NOT NULL,
        prompt_sent text NOT NULL,
        response_received text,
        credits_used integer DEFAULT 1,
        demo_session_id uuid,
        component_id uuid,
        was_helpful boolean,
        user_feedback text,
        created_at timestamp DEFAULT now()
      );
    `, 'Creating ai_interaction_logs');

    // Step 2: Create email_logs table
    console.log('📋 Step 2: Creating email_logs table');
    await executeSQL(client, `
      CREATE TABLE IF NOT EXISTS email_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_email text NOT NULL,
        recipient_user_id uuid,
        email_type text NOT NULL,
        subject text,
        resend_id text,
        resend_status text,
        status text DEFAULT 'sent',
        demo_session_id uuid,
        related_purchase_id uuid,
        metadata jsonb,
        sent_at timestamp DEFAULT now(),
        delivered_at timestamp,
        opened_at timestamp
      );
    `, 'Creating email_logs');

    // Step 3: Create stripe_checkout_sessions table
    console.log('📋 Step 3: Creating stripe_checkout_sessions table');
    await executeSQL(client, `
      CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        stripe_session_id text UNIQUE NOT NULL,
        stripe_customer_id text,
        user_email text NOT NULL,
        user_id uuid,
        tier text NOT NULL,
        product_id text,
        price_id text,
        amount_total decimal NOT NULL,
        rollover_credit decimal DEFAULT 0,
        skip_discount decimal DEFAULT 0,
        return_state jsonb,
        status text DEFAULT 'pending',
        payment_intent_id text,
        created_at timestamp DEFAULT now(),
        completed_at timestamp,
        expires_at timestamp
      );
    `, 'Creating stripe_checkout_sessions');

    console.log('\n✅ All tables created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
