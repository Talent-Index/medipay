import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function verifyRLS() {
  console.log('🔍 Verifying RLS Implementation in Neon Database...\n');

  try {
    // Check if RLS is enabled on tables
    console.log('1️⃣  Checking RLS Status on Tables:');
    console.log('═'.repeat(60));
    
    const rlsStatus = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean }>>`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename != '_prisma_migrations'
      ORDER BY tablename
    `;

    const allTablesHaveRLS = rlsStatus.every(t => t.rowsecurity);
    
    rlsStatus.forEach(table => {
      const status = table.rowsecurity ? '✅' : '❌';
      console.log(`${status} ${table.tablename.padEnd(35)} RLS: ${table.rowsecurity}`);
    });

    console.log('\n2️⃣  Checking RLS Policies:');
    console.log('═'.repeat(60));

    const policies = await prisma.$queryRaw<Array<{ 
      tablename: string; 
      policyname: string;
      cmd: string;
    }>>`
      SELECT tablename, policyname, cmd
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;

    const policyCount = policies.length;
    console.log(`Total Policies Created: ${policyCount}\n`);

    // Group by table
    const policiesByTable = policies.reduce((acc, policy) => {
      if (!acc[policy.tablename]) {
        acc[policy.tablename] = [];
      }
      acc[policy.tablename].push(policy);
      return acc;
    }, {} as Record<string, typeof policies>);

    Object.entries(policiesByTable).forEach(([table, tablePolicies]) => {
      console.log(`\n📋 ${table}:`);
      tablePolicies.forEach(p => {
        console.log(`   ✓ ${p.policyname} (${p.cmd})`);
      });
    });

    console.log('\n3️⃣  Checking RLS Helper Function:');
    console.log('═'.repeat(60));

    const functions = await prisma.$queryRaw<Array<{ 
      proname: string;
    }>>`
      SELECT proname
      FROM pg_proc
      WHERE proname = 'set_current_user_address'
    `;

    if (functions.length > 0) {
      console.log('✅ Function set_current_user_address exists');
    } else {
      console.log('❌ Function set_current_user_address NOT found');
    }

    console.log('\n4️⃣  Testing RLS Function:');
    console.log('═'.repeat(60));

    try {
      await prisma.$executeRawUnsafe(
        `SELECT set_current_user_address($1)`,
        '0xTEST123'
      );
      console.log('✅ RLS function executed successfully');
      
      const currentSetting = await prisma.$queryRaw<Array<{ setting: string }>>`
        SELECT current_setting('app.current_user_address', true) as setting
      `;
      console.log(`✅ Current user address set to: ${currentSetting[0]?.setting || 'null'}`);
    } catch (error) {
      console.log('❌ Error executing RLS function:', error);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log('═'.repeat(60));
    console.log(`Tables with RLS: ${rlsStatus.filter(t => t.rowsecurity).length}/${rlsStatus.length}`);
    console.log(`Total Policies: ${policyCount}`);
    console.log(`RLS Function: ${functions.length > 0 ? 'Present' : 'Missing'}`);
    
    if (allTablesHaveRLS && policyCount > 0 && functions.length > 0) {
      console.log('\n✨ RLS is FULLY ENABLED and CONFIGURED! ✨\n');
    } else {
      console.log('\n⚠️  RLS configuration incomplete! ⚠️\n');
    }

  } catch (error) {
    console.error('❌ Error verifying RLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRLS();
