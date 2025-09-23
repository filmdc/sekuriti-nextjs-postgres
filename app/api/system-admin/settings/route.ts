import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin, logSystemAction } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { ActivityType } from '@/lib/db/schema';
import { systemSettings, systemAuditLogs } from '@/lib/db/schema-system';
import { eq, desc } from 'drizzle-orm';

// GET /api/system-admin/settings - Get system settings
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const settings = await db
      .select()
      .from(systemSettings);

    // Transform to key-value pairs
    const settingsMap = settings.reduce((acc, setting) => {
      let value = setting.value;
      
      // Parse based on data type
      if (setting.dataType === 'boolean') {
        value = setting.value === 'true';
      } else if (setting.dataType === 'number') {
        value = parseInt(setting.value);
      } else if (setting.dataType === 'json') {
        try {
          value = JSON.parse(setting.value);
        } catch {
          value = setting.value;
        }
      }
      
      acc[setting.key] = {
        value,
        description: setting.description,
        category: setting.category,
        dataType: setting.dataType,
        isPublic: setting.isPublic,
        updatedAt: setting.updatedAt,
      };
      return acc;
    }, {} as Record<string, any>);

    // Get recent configuration changes
    const recentChanges = await db
      .select({
        id: systemAuditLogs.id,
        action: systemAuditLogs.action,
        metadata: systemAuditLogs.metadata,
        timestamp: systemAuditLogs.timestamp,
        userId: systemAuditLogs.userId,
      })
      .from(systemAuditLogs)
      .where(eq(systemAuditLogs.action, ActivityType.UPDATE_SYSTEM_SETTINGS))
      .orderBy(desc(systemAuditLogs.timestamp))
      .limit(10);

    return NextResponse.json({
      settings: settingsMap,
      recentChanges: recentChanges.map(change => ({
        id: change.id,
        action: change.action,
        description: change.metadata ? JSON.parse(change.metadata as any)?.description || 'Settings updated' : 'Settings updated',
        timestamp: change.timestamp,
      })),
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

// PUT /api/system-admin/settings - Update system settings
export const PUT = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    const { settings } = await req.json();
    
    const updatedSettings = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      // Check if setting exists
      const [existingSetting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);

      if (existingSetting) {
        // Update existing setting
        const [updated] = await db
          .update(systemSettings)
          .set({
            value: settingValue,
            updatedAt: new Date(),
            updatedBy: context.user.id,
          })
          .where(eq(systemSettings.key, key))
          .returning();
        
        updatedSettings.push(updated);
      } else {
        // Create new setting
        const [created] = await db
          .insert(systemSettings)
          .values({
            key,
            value: settingValue,
            category: 'general',
            dataType: typeof value === 'boolean' ? 'boolean' 
                    : typeof value === 'number' ? 'number'
                    : typeof value === 'object' ? 'json' 
                    : 'string',
            updatedBy: context.user.id,
          })
          .returning();
        
        updatedSettings.push(created);
      }
    }

    // Log the action
    await logSystemAction({
      userId: context.user.id,
      action: ActivityType.UPDATE_SYSTEM_SETTINGS,
      entityType: 'settings',
      metadata: {
        settingsUpdated: Object.keys(settings),
        description: `Updated ${Object.keys(settings).length} system setting(s)`,
      },
    });

    return NextResponse.json({
      success: true,
      updatedSettings,
      message: `Successfully updated ${updatedSettings.length} setting(s)`,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
