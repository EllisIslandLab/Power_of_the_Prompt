import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Create automatic backup before database changes
 */
export async function createAutomaticBackup(
  userId: string,
  tableName: string
) {
  try {
    const supabase = getSupabaseClient();
    // Fetch all data from table
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) throw error;

    // Create backup record in Supabase
    const backupId = `backup-${userId}-${tableName}-${Date.now()}`;

    await supabase
      .from('database_backups')
      .insert({
        backup_id: backupId,
        user_id: userId,
        table_name: tableName,
        backup_data: JSON.stringify(data),
        record_count: data?.length || 0,
        created_at: new Date().toISOString(),
        is_restorable: true
      });

    return {
      success: true,
      backupId,
      recordCount: data?.length || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Backup creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Export table data as CSV
 */
export async function exportTableAsCSV(
  userId: string,
  tableName: string
) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data to export'
      };
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create download blob
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}-backup-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      recordCount: data.length,
      fileName: link.download
    };
  } catch (error) {
    console.error('CSV export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
  backupId: string,
  userId: string,
  tableName: string
) {
  try {
    const supabase = getSupabaseClient();
    // Fetch backup
    const { data: backupData, error: fetchError } = await supabase
      .from('database_backups')
      .select('backup_data')
      .eq('backup_id', backupId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const restoredData = JSON.parse(backupData.backup_data);

    // Delete current data
    await supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId);

    // Insert restored data
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(restoredData);

    if (insertError) throw insertError;

    return {
      success: true,
      recordsRestored: restoredData.length,
      message: `Restored ${restoredData.length} records from ${new Date(backupId.split('-')[3]).toLocaleString()}`
    };
  } catch (error) {
    console.error('Restore failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get available backups for restoration
 */
export async function getAvailableBackups(userId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('database_backups')
      .select('backup_id, table_name, record_count, created_at')
      .eq('user_id', userId)
      .eq('is_restorable', true)
      .order('created_at', { ascending: false })
      .limit(30); // 30-day window

    if (error) throw error;

    return {
      success: true,
      backups: data || []
    };
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Warn client about destructive operations
 */
export function generateDestructiveOperationWarning(
  operation: 'delete' | 'modify_schema' | 'drop_table',
  details: {
    recordCount?: number;
    affectedColumns?: string[];
    affectedTables?: string[];
  }
): string {
  const warnings: Record<string, string> = {
    delete: `⚠️ WARNING: PERMANENT DATA DELETION
You are about to delete ${details.recordCount || 'unknown number of'} records.
This action CANNOT BE UNDONE unless you restore from a backup.

Backups are retained for 30 days.
Do you want to:
1. Create a backup first? (Recommended)
2. Download CSV backup first? (Recommended)
3. Proceed without backup (Not Recommended)`,

    modify_schema: `⚠️ WARNING: DATABASE SCHEMA MODIFICATION
You are about to modify the following columns: ${details.affectedColumns?.join(', ') || 'unknown'}

This may affect:
- Existing forms that reference these columns
- Automations and integrations
- Data integrity

Do you want to:
1. Review impact analysis first
2. Create backup and proceed
3. Cancel this operation`,

    drop_table: `⚠️ WARNING: TABLE DELETION
You are about to delete the entire table: ${details.affectedTables?.[0] || 'unknown'}

This action:
- Deletes ALL data permanently
- Breaks forms and automations
- Can ONLY be restored from backup

Do you want to:
1. Create backup first
2. Download CSV backup first
3. Cancel (Recommended)`
  };

  return warnings[operation] || 'This is a destructive operation. Please confirm.';
}

/**
 * Validate database operation is safe
 */
export function validateDatabaseOperation(
  operation: 'delete' | 'modify' | 'create',
  details: any
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (operation === 'delete' && !details.hasBackup) {
    warnings.push('⚠️ No backup created. Create one before deleting.');
  }

  if (operation === 'modify' && !details.schemaValidated) {
    warnings.push('⚠️ Schema changes not validated. Review impact first.');
  }

  if (operation === 'create' && !details.tableName) {
    warnings.push('⚠️ Table name is required.');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}
