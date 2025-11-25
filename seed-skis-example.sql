-- Example: Adding ski products to Tbl_Skis
-- You can copy this format and add your own ski data

-- Example ski products
INSERT INTO Tbl_Skis (Brand, Model, Year, Gender, Waist_Width, MSRP, Image_URL) 
VALUES 
    ('Nordica', 'Enforcer 94', 2024, 'Men''s/Unisex', 94.0, 699.99, '/images/nordica-enforcer-94.jpg'),
    ('Rossignol', 'Black Ops 98', 2024, 'Men''s/Unisex', 98.0, 749.99, '/images/rossignol-blackops-98.jpg'),
    ('Volkl', 'Blaze 94', 2024, 'Women''s', 94.0, 649.99, '/images/volkl-blaze-94.jpg');

-- After adding skis, you need to link them to attributes in Tbl_Ski_Attributes
-- Example: Link Nordica Enforcer 94 to attributes
-- First, get the Ski_ID (let's say it's 1) and Attribute_IDs from Tbl_Attributes

-- Example linking (you'll need to adjust Attribute_IDs based on what you inserted):
-- INSERT INTO Tbl_Ski_Attributes (Ski_ID, Attribute_ID) VALUES
--     (1, 3),  -- Advanced (Skill_Level)
--     (1, 5),  -- All-Mountain (Terrain)
--     (1, 10), -- Stiff / Damp (Flex_Profile)
--     (1, 15); -- Long & Fast (Turn_Style)

