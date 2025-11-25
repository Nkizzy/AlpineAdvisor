-- Alpine Advisor Database Schema
-- This file contains the SQL schema for all tables

-- Table 1: Tbl_Skis (Main Catalog)
CREATE TABLE IF NOT EXISTS Tbl_Skis (
    Ski_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Brand VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Year INTEGER NOT NULL,
    Gender VARCHAR(50) NOT NULL,
    Waist_Width DECIMAL(5, 2) NOT NULL,
    MSRP DECIMAL(10, 2) NOT NULL,
    Image_URL VARCHAR(500)
);

-- Table 2: Tbl_Attributes (Master Tag Dictionary)
CREATE TABLE IF NOT EXISTS Tbl_Attributes (
    Attribute_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Type VARCHAR(50) NOT NULL,
    Value VARCHAR(100) NOT NULL,
    UNIQUE(Type, Value)
);

-- Table 3: Tbl_Ski_Attributes (Join Table - Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS Tbl_Ski_Attributes (
    Ski_ID INTEGER NOT NULL,
    Attribute_ID INTEGER NOT NULL,
    PRIMARY KEY (Ski_ID, Attribute_ID),
    FOREIGN KEY (Ski_ID) REFERENCES Tbl_Skis(Ski_ID) ON DELETE CASCADE,
    FOREIGN KEY (Attribute_ID) REFERENCES Tbl_Attributes(Attribute_ID) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ski_gender ON Tbl_Skis(Gender);
CREATE INDEX IF NOT EXISTS idx_ski_msrp ON Tbl_Skis(MSRP);
CREATE INDEX IF NOT EXISTS idx_attributes_type ON Tbl_Attributes(Type);
CREATE INDEX IF NOT EXISTS idx_ski_attributes_ski ON Tbl_Ski_Attributes(Ski_ID);
CREATE INDEX IF NOT EXISTS idx_ski_attributes_attr ON Tbl_Ski_Attributes(Attribute_ID);

