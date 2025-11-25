-- Helper: First, check what Attribute_IDs you need
-- Run this to see all available attributes:
-- SELECT Attribute_ID, Type, Value FROM Tbl_Attributes ORDER BY Type, Attribute_ID;

-- Quick Reference:
-- Skill_Level: Beginner=1, Intermediate=2, Advanced=3, Expert=4
-- Terrain: All-Mountain=5, On-Piste=6, Powder=7, Park/Freestyle=8
-- Flex_Profile: Playful/Soft=9, Stiff/Damp=10, Buttery/Jib=11, Stiff/Jumps=12, Medium/Forgiving=13
-- Turn_Style: Short&Quick=14, Long&Fast=15
-- Ski_Feature: True Twin=16, Directional Twin=17

-- Example: Add a new ski and link it to attributes using LAST_INSERT_ROWID()
-- This works if you run both statements in the same transaction

-- Add the ski
INSERT INTO Tbl_Skis (Brand, Model, Year, Gender, Waist_Width, MSRP, Image_URL) 
VALUES ('Rossignol', 'Experience 88 Ti', 2024, 'Men''s/Unisex', 88.0, 599.99, '/images/rossignol-experience-88.jpg');

-- Link attributes (using the last inserted Ski_ID)
-- For this example, let's say the Ski_ID is 5 (adjust based on your database)
INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) VALUES
    (5, 2),   -- Intermediate (Skill_Level)
    (5, 6),   -- On-Piste (Terrain)
    (5, 10),  -- Stiff / Damp (Flex_Profile)
    (5, 15);  -- Long & Fast (Turn_Style)

