import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { assets } from '@/lib/db/schema-ir';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { z } from 'zod';

// Schema for validating CSV row data
const assetRowSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['hardware', 'software', 'service', 'data', 'personnel', 'facility', 'vendor', 'contract']),
  criticality: z.enum(['Critical', 'High', 'Medium', 'Low']),
  description: z.string().optional(),
  location: z.string().optional(),
  owner: z.string().optional(),
  ip_address: z.string().optional(),
  serial_number: z.string().optional(),
  asset_subtype: z.string().optional(), // For storing Server, Workstation, etc.
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        error: 'CSV file is empty or missing headers'
      }, { status: 400 });
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

    // Validate required headers
    const requiredHeaders = ['name', 'type', 'criticality'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `Missing required columns: ${missingHeaders.join(', ')}`
      }, { status: 400 });
    }

    // Parse rows
    const errors: string[] = [];
    const assetsToInsert: typeof assets.$inferInsert[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Parse CSV line (handle quoted values)
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(v =>
          v.trim().replace(/^"|"$/g, '').trim()
        ) || [];

        // Create object from headers and values
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate row data
        const validatedData = assetRowSchema.parse(rowData);

        // Prepare asset for insertion
        assetsToInsert.push({
          organizationId: team.id,
          name: validatedData.name,
          type: validatedData.type,
          criticality: validatedData.criticality,
          description: validatedData.description || null,
          metadata: {
            location: rowData.location || null,
            owner: rowData.owner || null,
            ipAddress: rowData.ip_address || null,
            serialNumber: rowData.serial_number || null,
            assetSubtype: rowData.asset_subtype || null, // Store the original type like Server, Workstation
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const issues = error.errors.map(e => e.message).join(', ');
          errors.push(`Row ${i}: ${issues}`);
        } else {
          errors.push(`Row ${i}: Invalid data`);
        }
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0 && assetsToInsert.length === 0) {
      return NextResponse.json({
        error: 'Import failed due to validation errors',
        errors: errors.slice(0, 10), // Return first 10 errors
        imported: 0
      }, { status: 400 });
    }

    // Insert valid assets into database
    if (assetsToInsert.length > 0) {
      await db.insert(assets).values(assetsToInsert);
    }

    return NextResponse.json({
      imported: assetsToInsert.length,
      total: lines.length - 1,
      errors: errors.slice(0, 10),
      message: `Successfully imported ${assetsToInsert.length} assets`
    });

  } catch (error) {
    console.error('Error importing assets:', error);
    return NextResponse.json(
      { error: 'Failed to import assets' },
      { status: 500 }
    );
  }
}