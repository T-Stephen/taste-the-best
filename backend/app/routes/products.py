from flask import Blueprint, jsonify, current_app
from bson.json_util import dumps
import json

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        # Access the MongoDB database we initialized in __init__.py
        db = current_app.db
        
        # Fetch all items from the "products" collection
        products_cursor = db.products.find({})
        
        # Convert MongoDB's BSON format to standard JSON
        products_list = json.loads(dumps(products_cursor))
        
        return jsonify({
            "status": "success",
            "results": len(products_list),
            "data": products_list
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch products from database"
        }), 500