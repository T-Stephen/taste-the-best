import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load the secret connection string
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# A master list of 30 authentic items
product_names = [
    # Pickles
    ("Authentic Mango Pickle", "pickles", 150), ("Spicy Garlic Pickle", "pickles", 160),
    ("Tangy Lemon Pickle", "pickles", 140), ("Gongura Pickle", "pickles", 170),
    ("Mixed Veg Pickle", "pickles", 130), ("Tomato Thokku", "pickles", 120),
    ("Amla (Gooseberry) Pickle", "pickles", 150), ("Green Chilli Pickle", "pickles", 110),
    ("Ginger Pickle", "pickles", 180), ("Onion Pickle", "pickles", 130),
    
    # Snacks
    ("Spicy Ribbon Pakoda", "snacks", 80), ("Garlic Murukku", "snacks", 65),
    ("Butter Murukku", "snacks", 70), ("Madras Mixture", "snacks", 90),
    ("Spicy Boondi", "snacks", 60), ("Kara Sev", "snacks", 75),
    ("Thattai", "snacks", 65), ("Peanut Chikki", "snacks", 45),
    ("Omapodi", "snacks", 55), ("Banana Chips", "snacks", 85),
    
    # Sweets
    ("Mysore Pak", "sweets", 120), ("Tirunelveli Halwa", "sweets", 150),
    ("Jalebi", "sweets", 90), ("Gulab Jamun", "sweets", 110),
    ("Kaju Katli", "sweets", 200), ("Motichoor Laddu", "sweets", 130),
    ("Rasgulla", "sweets", 100), ("Soan Papdi", "sweets", 80),
    ("Milk Peda", "sweets", 140), ("Badam Halwa", "sweets", 250)
]

INITIAL_PRODUCTS = []

# Automatically build the complete data structure with custom images!
for i, (name, category, price) in enumerate(product_names):
    # This creates a beautiful orange image with the product's name written on it
    image_text = name.replace(" ", "+")
    
    INITIAL_PRODUCTS.append({
        "id": f"prod_{i+1:03d}",
        "name": name,
        "category": category,
        "price": float(price),
        "stock": 40 + (i * 3) % 60, # Generates realistic varying stock levels
        "description": f"Delicious and authentic {name}, prepared with premium ingredients for the perfect taste.",
        "image_url": f"https://placehold.co/600x400/ea580c/ffffff?text={image_text}"
    })

def seed_database():
    try:
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(MONGO_URI)
        collection = client.get_database().products
        
        collection.delete_many({}) # Clear the old 3 items
        collection.insert_many(INITIAL_PRODUCTS) # Insert the new 30 items
        
        print(f"Success! Inserted {len(INITIAL_PRODUCTS)} fully-featured products into the cloud!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    seed_database()