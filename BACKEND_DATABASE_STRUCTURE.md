# Backend Database Structure and Quiz Mapping - Detailed Explanation

## Overview
The Alpine Advisor recommendation system uses a relational, tag-based SQL database architecture. The quiz collects user preferences, which are translated into a "wishlist" of desired attributes. The backend then queries the database to find skis that match the highest number of wishlist items, creating a Match_Score ranking system.

---

## Database Schema

### Table 1: `Tbl_Skis` (Main Catalog)
This is the primary table containing all ski product information.

**Columns:**
- `Ski_ID` (PRIMARY KEY, INT) - Unique identifier for each ski model
- `Brand` (VARCHAR) - Manufacturer name (e.g., "Nordica", "Rossignol")
- `Model` (VARCHAR) - Model name (e.g., "Enforcer", "Black Ops")
- `Year` (INT) - Model year (e.g., 2024, 2025)
- `Gender` (VARCHAR) - Target gender: "Men's/Unisex" or "Women's"
- `Waist_Width` (DECIMAL) - Width in millimeters at the waist (e.g., 88.0, 98.5, 104.0)
- `MSRP` (DECIMAL) - Manufacturer's Suggested Retail Price (e.g., 649.99, 899.00)
- `Image_URL` (VARCHAR) - URL path to product image

**Example Row:**
```
Ski_ID: 42
Brand: "Nordica"
Model: "Enforcer 94"
Year: 2024
Gender: "Men's/Unisex"
Waist_Width: 94.0
MSRP: 699.99
Image_URL: "/images/nordica-enforcer-94.jpg"
```

**Notes:**
- This table contains only direct product attributes (no tags/attributes)
- `Waist_Width` is stored but NOT used as a filter in queries (terrain tags handle categorization)
- `Gender` and `MSRP` are used as hard constraints (must match exactly or be within range)

---

### Table 2: `Tbl_Attributes` (Master Tag Dictionary)
This table acts as a master dictionary for all possible tags/attributes that can be assigned to skis.

**Columns:**
- `Attribute_ID` (PRIMARY KEY, INT) - Unique identifier for each attribute
- `Type` (VARCHAR) - Category of attribute (e.g., "Skill_Level", "Terrain", "Flex_Profile", "Turn_Style", "Ski_Feature")
- `Value` (VARCHAR) - The actual attribute value (e.g., "Advanced", "All-Mountain", "Stiff / Damp")

**Example Rows:**
```
Attribute_ID: 1, Type: "Skill_Level", Value: "Beginner"
Attribute_ID: 2, Type: "Skill_Level", Value: "Intermediate"
Attribute_ID: 3, Type: "Skill_Level", Value: "Advanced"
Attribute_ID: 4, Type: "Skill_Level", Value: "Expert"
Attribute_ID: 5, Type: "Terrain", Value: "All-Mountain"
Attribute_ID: 6, Type: "Terrain", Value: "On-Piste"
Attribute_ID: 7, Type: "Terrain", Value: "Powder"
Attribute_ID: 8, Type: "Terrain", Value: "Park / Freestyle"
Attribute_ID: 9, Type: "Flex_Profile", Value: "Playful / Soft"
Attribute_ID: 10, Type: "Flex_Profile", Value: "Stiff / Damp"
Attribute_ID: 11, Type: "Flex_Profile", Value: "Buttery / Jib"
Attribute_ID: 12, Type: "Flex_Profile", Value: "Stiff / Jumps"
Attribute_ID: 13, Type: "Flex_Profile", Value: "Medium / Forgiving"
Attribute_ID: 14, Type: "Turn_Style", Value: "Short & Quick"
Attribute_ID: 15, Type: "Turn_Style", Value: "Long & Fast"
Attribute_ID: 16, Type: "Ski_Feature", Value: "True Twin"
Attribute_ID: 17, Type: "Ski_Feature", Value: "Directional Twin"
```

**Attribute Type Breakdown:**

1. **Skill_Level** (4 values):
   - "Beginner" - Maps from quiz: "Greens"
   - "Intermediate" - Maps from quiz: "Blues"
   - "Advanced" - Maps from quiz: "Blacks"
   - "Expert" - Maps from quiz: "Double-Blacks"
   - **Important**: Park skis are tagged with appropriate skill levels (e.g., soft jib ski = "Intermediate", stiff jump ski = "Advanced" or "Expert")

2. **Terrain** (4 values):
   - "All-Mountain" - Maps from quiz: "All-Mountain" selection
   - "On-Piste" - Maps from quiz: "On-Piste / Groomed" selection
   - "Powder" - Maps from quiz: "Powder / Off-Piste" selection
   - "Park / Freestyle" - Maps from quiz: "Park / Freestyle" selection

3. **Flex_Profile** (5 values):
   - "Playful / Soft" - Maps from quiz: "Quick & Playful" style (non-park)
   - "Stiff / Damp" - Maps from quiz: "Powerful & Fast" style (non-park)
   - "Medium / Forgiving" - Maps from quiz: "Easy & Forgiving" style (non-park)
   - "Buttery / Jib" - Maps from quiz: "Quick & Playful" style when park is selected
   - "Stiff / Jumps" - Maps from quiz: "Powerful & Fast" style when park is selected
   - Note: "Easy & Forgiving" with park selected does NOT add a Flex_Profile tag (only adds Ski_Feature)

4. **Turn_Style** (2 values):
   - "Short & Quick" - Maps from quiz: "Quick & Playful" or "Easy & Forgiving" styles
   - "Long & Fast" - Maps from quiz: "Powerful & Fast" style

5. **Ski_Feature** (2 values):
   - "True Twin" - Pure park skis (fully symmetrical, center-mounted)
   - "Directional Twin" - All-mountain/park hybrid skis (slightly directional but still twin-tip)
   - **Trigger**: Added to wishlist when "Park / Freestyle" is selected in Question 2
   - **Note**: "Center Mount" is descriptive text only (not stored in database)

---

### Table 3: `Tbl_Ski_Attributes` (Many-to-Many Join Table)
This table creates the many-to-many relationship between skis and attributes, allowing each ski to have multiple tags.

**Columns:**
- `Ski_ID` (FOREIGN KEY → Tbl_Skis.Ski_ID, INT)
- `Attribute_ID` (FOREIGN KEY → Tbl_Attributes.Attribute_ID, INT)
- Composite PRIMARY KEY: (Ski_ID, Attribute_ID)

**Example Rows:**
```
Ski_ID: 42, Attribute_ID: 3    (Nordica Enforcer 94 is "Advanced")
Ski_ID: 42, Attribute_ID: 5    (Nordica Enforcer 94 is "All-Mountain")
Ski_ID: 42, Attribute_ID: 10   (Nordica Enforcer 94 is "Stiff / Damp")
Ski_ID: 42, Attribute_ID: 14   (Nordica Enforcer 94 is "Long & Fast")

Ski_ID: 87, Attribute_ID: 3    (Park ski is "Advanced")
Ski_ID: 87, Attribute_ID: 8    (Park ski is "Park / Freestyle")
Ski_ID: 87, Attribute_ID: 11  (Park ski is "Buttery / Jib")
Ski_ID: 87, Attribute_ID: 13  (Park ski is "Short & Quick")
Ski_ID: 87, Attribute_ID: 15  (Park ski is "True Twin")
```

**Notes:**
- A single ski can have multiple attributes (e.g., a ski can be both "Advanced" AND "Expert" if it suits both skill levels)
- A single attribute can be assigned to multiple skis
- This structure allows flexible tagging without duplicating ski data

---

## Quiz to Database Mapping

### Quiz Question Flow:
1. **Question 1**: Skill Level (single-select radio)
2. **Question 2**: Where do you plan to ski? (multi-select checkboxes) - **CORE QUESTION**
3. **Question 3**: Skiing Style (single-select radio)
4. **Question 4**: Gender (single-select radio)
5. **Question 5**: Budget (single-select radio, optional)

---

### Mapping Process: Building the Wishlist

The backend receives quiz answers and builds a "wishlist" of Attribute_IDs that the user wants. This wishlist is then used to find skis with matching tags.

#### Step 1: Question 1 (Skill Level) → Attribute Tag
**Quiz Answer**: "Blacks" (user selected "Blacks" trail type)

**Mapping Logic:**
- Look up Attribute_ID where Type='Skill_Level' AND Value='Advanced'
- Add this Attribute_ID to wishlist

**Example:**
```
Quiz Answer: "Blacks"
→ Attribute_ID: 3 (Skill_Level = "Advanced")
→ Wishlist: [3]
```

---

#### Step 2: Question 2 (Terrain - MULTI-SELECT) → Multiple Attribute Tags
**Quiz Answer**: ["All-Mountain", "Park / Freestyle"] (user selected both)

**Mapping Logic:**
- For EACH selected terrain option:
  - Look up Attribute_ID where Type='Terrain' AND Value matches selection
  - Add to wishlist

**Important:** Ski_Feature tags are NOT added here. They are determined in Step 3 based on the skiing style selection.

**Example:**
```
Quiz Answer: ["All-Mountain", "Park / Freestyle"]
→ Attribute_ID: 5 (Terrain = "All-Mountain")
→ Attribute_ID: 8 (Terrain = "Park / Freestyle")
→ Wishlist: [3, 5, 8]
```

**Important Notes:**
- Waist_Width is NOT filtered here (terrain tags handle categorization)
- Both "True Twin" and "Directional Twin" are added to support hybrid recommendations
- The multi-select nature allows users to express hybrid preferences (e.g., "I want a ski that works for both all-mountain AND park")

---

#### Step 3: Question 3 (Skiing Style) → Flex_Profile + Turn_Style + Ski_Feature Tags
**Quiz Answer**: "Quick & Playful" (user selected this style)

**Mapping Logic:**
1. Determine which Flex_Profile and Turn_Style tags match the answer
2. If park is selected: Use park-specific flex tags AND determine Ski_Feature tag
3. If park is NOT selected: Use standard flex tags (no Ski_Feature tag)
4. Add matching Attribute_IDs to wishlist

**Ski_Feature Logic (when park is selected):**
- "Quick & Playful" → Ski_Feature = "True Twin" (pure park ski for jibs/rails)
- "Powerful & Fast" → Ski_Feature = "True Twin" (pure park ski for jumps/halfpipe)
- "Easy & Forgiving" → Ski_Feature = "Directional Twin" (hybrid all-mountain/park ski)

**Example (Park NOT Selected):**
```
Quiz Answer: "Quick & Playful"
Park Selected: No
→ Attribute_ID: 9 (Flex_Profile = "Playful / Soft")
→ Attribute_ID: 13 (Turn_Style = "Short & Quick")
→ Wishlist: [3, 5, 8, 9, 13]
```

**Example (Park Selected - Quick & Playful):**
```
Quiz Answer: "Quick & Playful"
Park Selected: Yes (from Question 2)
→ Attribute_ID: 11 (Flex_Profile = "Buttery / Jib") [park-specific]
→ Attribute_ID: 13 (Turn_Style = "Short & Quick")
→ Attribute_ID: 15 (Ski_Feature = "True Twin") [pure park for jibs/rails]
→ Wishlist: [3, 5, 8, 11, 13, 15]
```

**Example (Park Selected - Easy & Forgiving):**
```
Quiz Answer: "Easy & Forgiving"
Park Selected: Yes (from Question 2)
→ Attribute_ID: 13 (Turn_Style = "Short & Quick")
→ Attribute_ID: 16 (Ski_Feature = "Directional Twin") [hybrid all-mountain/park]
→ Wishlist: [3, 5, 8, 13, 16]
```

**Style Mapping Table:**

| Quiz Answer | Park Selected? | Flex_Profile | Turn_Style | Ski_Feature |
|------------|----------------|--------------|------------|-------------|
| "Powerful & Fast" | No | "Stiff / Damp" (10) | "Long & Fast" (14) | (none) |
| "Powerful & Fast" | Yes | "Stiff / Jumps" (12) | "Long & Fast" (14) | "True Twin" (15) |
| "Quick & Playful" | No | "Playful / Soft" (9) | "Short & Quick" (13) | (none) |
| "Quick & Playful" | Yes | "Buttery / Jib" (11) | "Short & Quick" (13) | "True Twin" (15) |
| "Easy & Forgiving" | No | "Medium / Forgiving" (17) | "Short & Quick" (13) | (none) |
| "Easy & Forgiving" | Yes | (none) | "Short & Quick" (13) | "Directional Twin" (16) |

---

#### Step 4: Question 4 (Gender) → Direct Column Filter
**Quiz Answer**: "Men's/Unisex"

**Mapping Logic:**
- This is a HARD CONSTRAINT (must match exactly)
- NOT added to wishlist - used as WHERE clause filter

**Example:**
```
Quiz Answer: "Men's/Unisex"
→ WHERE clause: Tbl_Skis.Gender = 'Men's/Unisex'
→ Wishlist unchanged: [3, 5, 8, 15, 16, 11, 13]
```

---

#### Step 5: Question 5 (Budget) → Direct Column Filter
**Quiz Answer**: "$400-$700" (user selected mid-range)

**Mapping Logic:**
- This is a HARD CONSTRAINT (optional)
- NOT added to wishlist - used as WHERE clause filter
- If "No Preference" selected: No filter applied

**Example:**
```
Quiz Answer: "$400-$700"
→ WHERE clause: Tbl_Skis.MSRP <= 700
→ Wishlist unchanged: [3, 5, 8, 15, 16, 11, 13]
```

**Budget Range Mapping:**
- "$200-$400" → MSRP <= 400
- "$400-$700" → MSRP <= 700
- "$700-$1000" → MSRP <= 1000
- "$1000+" → MSRP > 1000
- "No Preference" → No filter (MSRP filter omitted)

---

## SQL Query Structure

### Complete Query Pseudocode:

```sql
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
  -- Hard constraints (must match exactly)
  s.Gender = :gender
  AND (s.MSRP <= :maxPrice OR :maxPrice IS NULL)
  -- Wishlist matching (count how many match)
  AND sa.Attribute_ID IN (:wishlistAttributeIDs)
GROUP BY 
  s.Ski_ID, 
  s.Brand, 
  s.Model, 
  s.Year, 
  s.Gender, 
  s.Waist_Width, 
  s.MSRP, 
  s.Image_URL
HAVING COUNT(DISTINCT sa.Attribute_ID) > 0  -- At least one match required
ORDER BY 
  Match_Score DESC,  -- Highest match score first
  s.MSRP ASC         -- Then by price (lowest first)
LIMIT 10
```

### Query Explanation:

1. **SELECT Clause:**
   - Selects all ski product data from `Tbl_Skis`
   - Calculates `Match_Score` = COUNT of matching Attribute_IDs from wishlist

2. **FROM/JOIN:**
   - Starts with `Tbl_Skis` (all skis)
   - LEFT JOINs `Tbl_Ski_Attributes` to get tags for each ski
   - LEFT JOIN ensures skis with no tags are still included (though they'll be filtered out by HAVING clause)

3. **WHERE Clause:**
   - **Hard Constraints**: Gender and MSRP must match exactly (or be within range)
   - **Wishlist Matching**: Only includes Attribute_IDs that are in the user's wishlist
   - This filters to skis that have at least one matching tag

4. **GROUP BY:**
   - Groups by all ski columns to aggregate the COUNT function
   - Each ski appears once in results

5. **HAVING Clause:**
   - Ensures only skis with at least one matching tag are returned
   - Filters out skis with Match_Score = 0

6. **ORDER BY:**
   - Primary sort: Match_Score DESC (best matches first)
   - Secondary sort: MSRP ASC (cheapest first within same score)

7. **LIMIT:**
   - Returns top 10 results

---

## Complete Example: End-to-End Flow

### User Quiz Answers:
1. Skill Level: "Blacks" (Advanced)
2. Terrain: ["All-Mountain", "Park / Freestyle"] (multi-select)
3. Skiing Style: "Quick & Playful"
4. Gender: "Men's/Unisex"
5. Budget: "$400-$700"

### Backend Processing:

#### Step 1: Build Wishlist
```
Question 1: "Blacks"
→ Attribute_ID: 3 (Skill_Level = "Advanced")

Question 2: ["All-Mountain", "Park / Freestyle"]
→ Attribute_ID: 5 (Terrain = "All-Mountain")
→ Attribute_ID: 8 (Terrain = "Park / Freestyle")

Question 3: "Quick & Playful" (park is selected)
→ Attribute_ID: 11 (Flex_Profile = "Buttery / Jib") [park-specific]
→ Attribute_ID: 13 (Turn_Style = "Short & Quick")
→ Attribute_ID: 15 (Ski_Feature = "True Twin") [determined by style + park]

Final Wishlist: [3, 5, 8, 11, 13, 15]
```

#### Step 2: Build Hard Constraints
```
Question 4: "Men's/Unisex"
→ WHERE: Gender = 'Men's/Unisex'

Question 5: "$400-$700"
→ WHERE: MSRP <= 700
```

#### Step 3: Execute SQL Query
```sql
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
  s.Gender = 'Men's/Unisex'
  AND s.MSRP <= 700
  AND sa.Attribute_ID IN (3, 5, 8, 11, 13, 15)
GROUP BY s.Ski_ID, s.Brand, s.Model, s.Year, s.Gender, s.Waist_Width, s.MSRP, s.Image_URL
HAVING COUNT(DISTINCT sa.Attribute_ID) > 0
ORDER BY Match_Score DESC, s.MSRP ASC
LIMIT 10
```

#### Step 4: Example Results

**Ski A (Pure Park - matches user's "Quick & Playful" + park preference):**
- Tags: [Park / Freestyle, Advanced, Buttery / Jib, Short & Quick, True Twin]
- Matching Tags: [8, 3, 11, 13, 15] = 5 matches
- **Match_Score: 5**

**Ski B (Hybrid All-Mountain/Park - but wrong Ski_Feature):**
- Tags: [All-Mountain, Park / Freestyle, Advanced, Buttery / Jib, Short & Quick, Directional Twin]
- Matching Tags: [5, 8, 3, 11, 13] = 5 matches (Directional Twin doesn't match - user wants True Twin)
- **Match_Score: 5** (but less ideal due to Ski_Feature mismatch)

**Ski C (All-Mountain Only - no park):**
- Tags: [All-Mountain, Advanced, Playful / Soft, Short & Quick]
- Matching Tags: [5, 3, 13] = 3 matches (missing Park / Freestyle and park-specific tags)
- **Match_Score: 3**

**Result Order:**
1. Ski A (Match_Score: 5, MSRP: $599) - Best match (all tags including correct Ski_Feature)
2. Ski B (Match_Score: 5, MSRP: $650) - Good match but wrong Ski_Feature type
3. Ski C (Match_Score: 3, MSRP: $550) - Lower match (missing park tags)

---

## Key Design Principles

### 1. Wishlist Approach
- Collects ALL desired attributes into a single array
- Uses COUNT to find skis with the most matches
- Naturally handles hybrid preferences (multiple terrain selections)

### 2. Hard Constraints vs. Soft Matching
- **Hard Constraints** (must match exactly):
  - Gender
  - MSRP (budget range)
- **Soft Matching** (wishlist scoring):
  - All attribute tags (Skill_Level, Terrain, Flex_Profile, Turn_Style, Ski_Feature)
  - Higher Match_Score = better fit

### 3. Hybrid Ski Support
- Multi-select Question 2 allows users to select multiple terrains
- Wishlist includes all selected terrain tags
- Skis tagged with multiple matching terrains score higher
- Ski_Feature tags ("True Twin" vs. "Directional Twin") differentiate pure park vs. hybrid skis

### 4. Park-Specific Logic
- When "Park / Freestyle" is selected in Question 2:
  - Uses park-specific Flex_Profile tags ("Buttery / Jib", "Stiff / Jumps") in Question 3
  - Ski_Feature tag is determined by the skiing style selection in Question 3:
    - "Quick & Playful" → "True Twin" (pure park for jibs/rails)
    - "Powerful & Fast" → "True Twin" (pure park for jumps/halfpipe)
    - "Easy & Forgiving" → "Directional Twin" (hybrid all-mountain/park)
- Park skis are tagged with appropriate Skill_Level (not separate park skill system)

### 5. Waist_Width Handling
- Waist_Width is stored in `Tbl_Skis` but NOT used as a filter
- Terrain tags handle the categorization (e.g., "All-Mountain" skis typically have 90-104mm waist width)
- This keeps the system flexible and tag-based rather than rigid width ranges

---

## Database Population Notes

### Tagging Strategy:
- Each ski should be tagged with ALL applicable attributes
- A ski can have multiple Skill_Level tags if it suits multiple skill levels
- A ski can have multiple Terrain tags if it's versatile
- Park skis should have BOTH Skill_Level AND Ski_Feature tags

### Example Ski Tagging:
**Nordica Enforcer 94 (All-Mountain Advanced Ski):**
- Skill_Level: "Advanced", "Expert"
- Terrain: "All-Mountain", "On-Piste"
- Flex_Profile: "Stiff / Damp"
- Turn_Style: "Long & Fast"

**Armada ARV 96 (Hybrid All-Mountain/Park Ski):**
- Skill_Level: "Intermediate", "Advanced"
- Terrain: "All-Mountain", "Park / Freestyle"
- Flex_Profile: "Playful / Soft"
- Turn_Style: "Short & Quick"
- Ski_Feature: "Directional Twin"

**Line Blend (Pure Park Ski):**
- Skill_Level: "Intermediate", "Advanced"
- Terrain: "Park / Freestyle"
- Flex_Profile: "Buttery / Jib"
- Turn_Style: "Short & Quick"
- Ski_Feature: "True Twin"

**Example: Easy & Forgiving with Park (Hybrid Ski):**
- Skill_Level: "Intermediate", "Advanced"
- Terrain: "All-Mountain", "Park / Freestyle"
- Flex_Profile: "Medium / Forgiving" (if also suitable for non-park) OR no Flex_Profile (if park-only)
- Turn_Style: "Short & Quick"
- Ski_Feature: "Directional Twin"

---

## Summary

The system uses a flexible, tag-based architecture that:
1. Allows skis to have multiple attributes (many-to-many relationship)
2. Supports hybrid preferences through multi-select questions
3. Ranks results by Match_Score (number of matching attributes)
4. Uses hard constraints for Gender and Budget
5. Handles park-specific logic through conditional attribute selection
6. Maintains flexibility through tags rather than rigid width ranges

This design enables the system to recommend skis that match user preferences across multiple dimensions, with hybrid skis naturally scoring higher when users select multiple terrain types.

