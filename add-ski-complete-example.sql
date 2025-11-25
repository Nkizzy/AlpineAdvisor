-- Complete example: Adding a new ski product with all its attributes
-- This shows the two-step process

-- STEP 1: Insert the ski into Tbl_Skis
-- The Ski_ID will be auto-generated (you don't need to specify it)
INSERT INTO Tbl_Skis (Brand, Model, Year, Gender, Waist_Width, MSRP, Image_URL) 
VALUES ('Nordica', 'Enforcer 100', 2024, 'Men''s/Unisex', 100.0, 749.99, '/images/nordica-enforcer-100.jpg');

-- STEP 2: Link the ski to its attributes in Tbl_Ski_Attributes
-- You need to know the Ski_ID (let's say it's 4) and the Attribute_IDs
-- To find Attribute_IDs, query: SELECT Attribute_ID, Type, Value FROM Tbl_Attributes;

-- Example: Link Ski_ID 4 to various attributes
-- (Adjust the Ski_ID based on what was auto-generated)
INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) VALUES
    (4, 3),   -- Advanced (Skill_Level)
    (4, 5),   -- All-Mountain (Terrain)
    (4, 7),   -- Powder (Terrain) - can have multiple terrain types
    (4, 10),  -- Stiff / Damp (Flex_Profile)
    (4, 15);  -- Long & Fast (Turn_Style)

-- NOTE: If you're not sure what the Ski_ID will be, you can use a subquery:
-- INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID)
-- SELECT 
--     (SELECT Ski_ID FROM Tbl_Skis WHERE Brand = 'Nordica' AND Model = 'Enforcer 100' AND Year = 2024),
--     3
-- UNION ALL
-- SELECT 
--     (SELECT Ski_ID FROM Tbl_Skis WHERE Brand = 'Nordica' AND Model = 'Enforcer 100' AND Year = 2024),
--     5;
-- (This is more complex but works if you don't know the ID)

