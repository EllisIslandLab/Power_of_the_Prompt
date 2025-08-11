import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET(request: NextRequest) {
  try {
    // Fetch records from Airtable Portfolio table
    const records = await base('Portfolio').select({
      view: 'Grid view', // Use default view or specify a custom view
      sort: [{ field: 'Order', direction: 'asc' }] // Optional: sort by order field
    }).all()

    // Transform Airtable records to our portfolio format
    const portfolioItems = records
      .map((record) => {
        const fields = record.fields
        
        return {
          id: record.id,
          title: fields['Title'] || '',
          siteName: fields['Site Name'] || fields['Category'] || '',
          price: fields['Price'] ? (typeof fields['Price'] === 'number' ? `$${fields['Price'].toLocaleString()}` : fields['Price']) : '$899',
          description: fields['Description'] || '',
          category: fields['Category'] || '',
          demoUrl: fields['Demo URL'] || '#',
          technologies: fields['Technologies'] ? 
            (Array.isArray(fields['Technologies']) ? fields['Technologies'] : (fields['Technologies'] as string).split(',').map(t => t.trim())) : 
            [],
          features: fields['Features'] ? 
            (Array.isArray(fields['Features']) ? fields['Features'] : (fields['Features'] as string).split(',').map(f => f.trim())) : 
            [],
          imageUrl: fields['Image'] && Array.isArray(fields['Image']) && fields['Image'][0] ? (fields['Image'][0] as any).url : '/api/placeholder/600/400',
          backupUrls: fields['Backup URLs'] ? 
            (Array.isArray(fields['Backup URLs']) ? fields['Backup URLs'] : (fields['Backup URLs'] as string).split(',').map(u => u.trim())) : 
            []
        }
      })
      .filter(item => item.title && typeof item.title === 'string' && item.title.trim() !== '') // Filter out records with empty titles

    return NextResponse.json({
      success: true,
      data: portfolioItems
    })

  } catch (error) {
    console.error('Airtable Portfolio API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch portfolio items',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined,
        config: process.env.NODE_ENV === 'development' ? {
          hasApiKey: !!process.env.AIRTABLE_API_KEY,
          hasBaseId: !!process.env.AIRTABLE_BASE_ID,
          baseId: process.env.AIRTABLE_BASE_ID,
          tableName: 'Portfolio'
        } : undefined
      },
      { status: 500 }
    )
  }
}