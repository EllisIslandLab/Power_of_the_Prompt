import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { categoryName, subcategoryName, categoryId } = await request.json();

    const supabase = getSupabase(true);

    // Check for exact duplicate category
    if (categoryName) {
      const { data: existingCategory } = await supabase
        .from('website_categories' as any)
        .select('id, name')
        .ilike('name', categoryName)
        .single() as any;

      if (existingCategory) {
        return NextResponse.json({
          isDuplicate: true,
          duplicateName: categoryName,
          type: 'category'
        });
      }
    }

    // Check for exact duplicate subcategory
    if (subcategoryName && categoryId) {
      const { data: existingSubcategory } = await supabase
        .from('website_subcategories' as any)
        .select('id, name')
        .eq('category_id', categoryId)
        .ilike('name', subcategoryName)
        .single() as any;

      if (existingSubcategory) {
        return NextResponse.json({
          isDuplicate: true,
          duplicateName: subcategoryName,
          type: 'subcategory'
        });
      }
    }

    // Check for synonyms using Claude AI
    let allCategories = [];
    let allSubcategories = [];

    if (categoryName) {
      const { data: categories } = await supabase
        .from('website_categories' as any)
        .select('id, name')
        .eq('is_active', true) as any;

      allCategories = categories || [];
    }

    if (subcategoryName && categoryId) {
      const { data: subcategories } = await supabase
        .from('website_subcategories' as any)
        .select('id, name')
        .eq('category_id', categoryId) as any;

      allSubcategories = subcategories || [];
    }

    // Use Claude to find synonyms
    if ((categoryName && allCategories.length > 0) || (subcategoryName && allSubcategories.length > 0)) {
      const itemType = categoryName ? 'category' : 'subcategory';
      const itemName = categoryName || subcategoryName;
      const existingItems = categoryName ? allCategories : allSubcategories;

      const prompt = `You are a business categorization expert. Analyze if the following ${itemType} is synonymous with any existing ${itemType}.

User's ${itemType}: "${itemName}"

Existing ${itemType}s in our system:
${existingItems.map((item: any) => `- ${item.name}`).join('\n')}

Determine if the user's ${itemType} is a close synonym or variation of any existing ${itemType}.
- Return the NAME of the matching ${itemType} if you find a synonym (e.g., "Luxury Hotels" is synonymous with "High-End Accommodations")
- Return "NONE" if there's no clear synonym match
- Be strict: only return a match if the ${itemType}s are truly similar in business meaning

Respond with ONLY the matching ${itemType} name or "NONE".`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const response = message.content[0];
      if (response.type === 'text') {
        const matchedName = response.text.trim();

        if (matchedName !== 'NONE' && matchedName.length > 0) {
          const matchedItem = existingItems.find(
            (item: any) => item.name.toLowerCase() === matchedName.toLowerCase()
          );

          if (matchedItem) {
            return NextResponse.json({
              isDuplicate: false,
              synonym: {
                id: matchedItem.id,
                name: matchedItem.name
              }
            });
          }
        }
      }
    }

    // No duplicate or synonym found
    return NextResponse.json({
      isDuplicate: false,
      synonym: null
    });

  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
