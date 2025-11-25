-- Seed data for Tbl_Attributes
-- This populates the master attribute dictionary with all possible tags

-- Skill_Level attributes (4 values)
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Skill_Level', 'Beginner');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Skill_Level', 'Intermediate');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Skill_Level', 'Advanced');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Skill_Level', 'Expert');

-- Terrain attributes (4 values)
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Terrain', 'All-Mountain');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Terrain', 'On-Piste');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Terrain', 'Powder');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Terrain', 'Park / Freestyle');

-- Flex_Profile attributes (5 values)
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Flex_Profile', 'Playful / Soft');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Flex_Profile', 'Stiff / Damp');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Flex_Profile', 'Buttery / Jib');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Flex_Profile', 'Stiff / Jumps');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Flex_Profile', 'Medium / Forgiving');

-- Turn_Style attributes (2 values)
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Turn_Style', 'Short & Quick');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Turn_Style', 'Long & Fast');

-- Ski_Feature attributes (2 values)
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Ski_Feature', 'True Twin');
INSERT OR IGNORE INTO Tbl_Attributes (Type, Value) VALUES ('Ski_Feature', 'Directional Twin');

