-- Template for adding a new ski product
-- Copy this and fill in your ski details

-- STEP 1: Add the ski product
INSERT INTO Tbl_Skis (Brand, Model, Year, Gender, Waist_Width, MSRP, Image_URL) 
VALUES ('BRAND_HERE', 'MODEL_HERE', 2024, 'Men''s/Unisex', 94.0, 699.99, '/images/your-image.jpg');

-- STEP 2: Find the Ski_ID that was just created
-- Run this query to see the last inserted ski:
-- SELECT Ski_ID, Brand, Model FROM Tbl_Skis ORDER BY Ski_ID DESC LIMIT 1;

-- STEP 3: Link the ski to its attributes
-- Replace SKI_ID_HERE with the actual Ski_ID from step 2
-- Use the Attribute_ID reference below to choose the right numbers

INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) VALUES
    (SKI_ID_HERE, 3),   -- Advanced (Skill_Level) - change to 1, 2, 3, or 4
    (SKI_ID_HERE, 5),   -- All-Mountain (Terrain) - can add multiple: 5, 6, 7, or 8
    (SKI_ID_HERE, 10),  -- Stiff / Damp (Flex_Profile) - change to 9, 10, 11, 12, or 13
    (SKI_ID_HERE, 15);  -- Long & Fast (Turn_Style) - change to 14 or 15

-- ATTRIBUTE_ID REFERENCE:
-- Skill_Level: Beginner=1, Intermediate=2, Advanced=3, Expert=4
-- Terrain: All-Mountain=5, On-Piste=6, Powder=7, Park/Freestyle=8
-- Flex_Profile: Playful/Soft=9, Stiff/Damp=10, Buttery/Jib=11, Stiff/Jumps=12, Medium/Forgiving=13
-- Turn_Style: Short&Quick=14, Long&Fast=15
-- Ski_Feature: True Twin=16, Directional Twin=17 (only for park skis)

