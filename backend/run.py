import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
from bson.objectid import ObjectId  # NEW: Needed to update specific orders by their MongoDB ID

# Load the secret connection string
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app)

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client['taste_the_best']

# ==========================================
# CUSTOMER ROUTES (The Storefront)
# ==========================================

@app.route('/api/products', methods=['GET'], strict_slashes=False)
def get_products():
    try:
        products = list(db.products.find({}, {'_id': 0}))
        return jsonify({"status": "success", "results": len(products), "data": products})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/orders', methods=['POST'], strict_slashes=False)
def place_order():
    try:
        order_data = request.json
        order_data['created_at'] = datetime.utcnow()
        order_data['status'] = 'Processing'
        
        result = db.orders.insert_one(order_data)
        
        return jsonify({
            "status": "success", 
            "message": "Order saved to database!",
            "order_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ==========================================
# ADMIN ROUTES (The Command Center)
# ==========================================

# Route 3: Fetch all orders for the dashboard
@app.route('/api/admin/orders', methods=['GET'], strict_slashes=False)
def get_all_orders():
    try:
        # Fetch all orders, sorted by newest first (-1)
        orders = list(db.orders.find().sort('created_at', -1))
        
        # Convert the complex MongoDB ObjectIds into readable strings for React
        for order in orders:
            order['_id'] = str(order['_id'])
            
        return jsonify({"status": "success", "data": orders})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Route 4: Update the shipping status of an order
@app.route('/api/admin/orders/<order_id>', methods=['PUT'], strict_slashes=False)
def update_order_status(order_id):
    try:
        new_status = request.json.get('status')
        
        # Find the order by its ID and update the 'status' field
        db.orders.update_one(
            {'_id': ObjectId(order_id)},
            {'$set': {'status': new_status}}
        )
        return jsonify({"status": "success", "message": f"Order marked as {new_status}!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)