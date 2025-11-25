// Cloudflare Pages Function for ski recommendations
// This endpoint queries the D1 database based on quiz answers

interface QuizAnswers {
  skillLevel: string;
  terrain: string[];
  skiingStyle: string;
  gender: string;
  budget: string;
}

interface SkiRecommendation {
  Ski_ID: number;
  Brand: string;
  Model: string;
  Year: number;
  Gender: string;
  Waist_Width: number;
  MSRP: number;
  Image_URL: string | null;
  Match_Score: number;
}

// Map quiz answers to attribute values
const skillLevelMap: Record<string, string> = {
  greens: 'Beginner',
  blues: 'Intermediate',
  blacks: 'Advanced',
  'double-blacks': 'Expert',
};

const terrainMap: Record<string, string> = {
  'all-mountain': 'All-Mountain',
  'on-piste': 'On-Piste',
  powder: 'Powder',
  park: 'Park / Freestyle',
};

const styleMap: Record<string, { flexProfile?: string; turnStyle: string; skiFeature?: string }> = {
  'powerful-fast': {
    flexProfile: 'Stiff / Damp',
    turnStyle: 'Long & Fast',
  },
  'quick-playful': {
    flexProfile: 'Playful / Soft',
    turnStyle: 'Short & Quick',
  },
  'easy-forgiving': {
    flexProfile: 'Medium / Forgiving',
    turnStyle: 'Short & Quick',
  },
};

const parkStyleMap: Record<string, { flexProfile?: string; turnStyle: string; skiFeature: string }> = {
  'powerful-fast': {
    flexProfile: 'Stiff / Jumps',
    turnStyle: 'Long & Fast',
    skiFeature: 'True Twin',
  },
  'quick-playful': {
    flexProfile: 'Buttery / Jib',
    turnStyle: 'Short & Quick',
    skiFeature: 'True Twin',
  },
  'easy-forgiving': {
    turnStyle: 'Short & Quick',
    skiFeature: 'Directional Twin',
  },
};

// Budget filter configuration
interface BudgetFilter {
  minPrice: number | null;
  maxPrice: number | null;
}

const budgetMap: Record<string, BudgetFilter> = {
  'under-500': { minPrice: null, maxPrice: 500 },
  '500-750': { minPrice: 500, maxPrice: 750 },
  '750-plus': { minPrice: 750, maxPrice: null },
  'no-preference': { minPrice: null, maxPrice: null },
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async ({ request, env }) => {
  try {
    // Check if DB binding is available
    if (!env.DB) {
      console.error('D1 database binding not found. Make sure it is configured in Cloudflare Pages.');
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const answers: QuizAnswers = await request.json();
    console.log('Received quiz answers:', JSON.stringify(answers));

    // Step 1: Build wishlist of Attribute_IDs
    const wishlistAttributeIDs: number[] = [];

    // Question 1: Skill Level
    const skillLevelValue = skillLevelMap[answers.skillLevel];
    if (skillLevelValue) {
      const skillResult = await env.DB.prepare(
        'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
      )
        .bind('Skill_Level', skillLevelValue)
        .first<{ Attribute_ID: number }>();
      if (skillResult) {
        wishlistAttributeIDs.push(skillResult.Attribute_ID);
      }
    }

    // Question 2: Terrain (multi-select)
    const isParkSelected = answers.terrain.includes('park');
    for (const terrainKey of answers.terrain) {
      const terrainValue = terrainMap[terrainKey];
      if (terrainValue) {
        const terrainResult = await env.DB.prepare(
          'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
        )
          .bind('Terrain', terrainValue)
          .first<{ Attribute_ID: number }>();
        if (terrainResult) {
          wishlistAttributeIDs.push(terrainResult.Attribute_ID);
        }
      }
    }

    // If park is selected, add both True Twin and Directional Twin to wishlist
    // (The actual Ski_Feature will be determined in Question 3, but we want to match both types)
    if (isParkSelected) {
      const trueTwinResult = await env.DB.prepare(
        'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
      )
        .bind('Ski_Feature', 'True Twin')
        .first<{ Attribute_ID: number }>();
      if (trueTwinResult) {
        wishlistAttributeIDs.push(trueTwinResult.Attribute_ID);
      }

      const directionalTwinResult = await env.DB.prepare(
        'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
      )
        .bind('Ski_Feature', 'Directional Twin')
        .first<{ Attribute_ID: number }>();
      if (directionalTwinResult) {
        wishlistAttributeIDs.push(directionalTwinResult.Attribute_ID);
      }
    }

    // Question 3: Skiing Style
    const styleMapping = isParkSelected
      ? parkStyleMap[answers.skiingStyle]
      : styleMap[answers.skiingStyle];

    if (styleMapping) {
      if (styleMapping.flexProfile) {
        const flexResult = await env.DB.prepare(
          'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
        )
          .bind('Flex_Profile', styleMapping.flexProfile)
          .first<{ Attribute_ID: number }>();
        if (flexResult) {
          wishlistAttributeIDs.push(flexResult.Attribute_ID);
        }
      }

      const turnResult = await env.DB.prepare(
        'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
      )
        .bind('Turn_Style', styleMapping.turnStyle)
        .first<{ Attribute_ID: number }>();
      if (turnResult) {
        wishlistAttributeIDs.push(turnResult.Attribute_ID);
      }

      // Add Ski_Feature if park is selected and style mapping includes it
      if (isParkSelected && styleMapping.skiFeature) {
        const featureResult = await env.DB.prepare(
          'SELECT Attribute_ID FROM Tbl_Attributes WHERE Type = ? AND Value = ?'
        )
          .bind('Ski_Feature', styleMapping.skiFeature)
          .first<{ Attribute_ID: number }>();
        if (featureResult) {
          wishlistAttributeIDs.push(featureResult.Attribute_ID);
        }
      }
    }

    // Step 2: Build numerical filters
    const genderFilter = answers.gender === "mens-unisex" ? "Men's/Unisex" : "Women's";
    const budgetFilter = budgetMap[answers.budget] || budgetMap['no-preference'];

    // Step 3: Execute SQL query
    if (wishlistAttributeIDs.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build the query with placeholders for the wishlist
    const placeholders = wishlistAttributeIDs.map(() => '?').join(',');
    
    // Build MSRP filter condition based on budget range
    let msrpCondition = '';
    const bindings: any[] = [genderFilter];
    
    if (budgetFilter.minPrice !== null && budgetFilter.maxPrice !== null) {
      // Range: minPrice < MSRP <= maxPrice
      msrpCondition = 'AND s.MSRP > ? AND s.MSRP <= ?';
      bindings.push(budgetFilter.minPrice, budgetFilter.maxPrice);
    } else if (budgetFilter.maxPrice !== null) {
      // Under maxPrice: MSRP <= maxPrice
      msrpCondition = 'AND s.MSRP <= ?';
      bindings.push(budgetFilter.maxPrice);
    } else if (budgetFilter.minPrice !== null) {
      // Over minPrice: MSRP > minPrice
      msrpCondition = 'AND s.MSRP > ?';
      bindings.push(budgetFilter.minPrice);
    }
    // If both are null (no-preference), no MSRP filter is applied
    
    const query = `
      SELECT 
        s.Ski_ID,
        s.Brand,
        s.Model,
        s.Year,
        s.Gender,
        s.Waist_Width,
        s.MSRP,
        s.Image_URL,
        COUNT(DISTINCT sa.Attribute_ID) AS Match_Score
      FROM Tbl_Skis s
      LEFT JOIN Tbl_Ski_Attributes sa ON s.Ski_ID = sa.Ski_ID
      WHERE 
        s.Gender = ?
        ${msrpCondition}
        AND sa.Attribute_ID IN (${placeholders})
      GROUP BY s.Ski_ID, s.Brand, s.Model, s.Year, s.Gender, s.Waist_Width, s.MSRP, s.Image_URL
      HAVING COUNT(DISTINCT sa.Attribute_ID) > 0
      ORDER BY Match_Score DESC, s.MSRP ASC
      LIMIT 10
    `;

    bindings.push(...wishlistAttributeIDs);
    const result = await env.DB.prepare(query).bind(...bindings).all<SkiRecommendation>();

    return new Response(JSON.stringify({ recommendations: result.results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorStack);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch recommendations',
      details: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

