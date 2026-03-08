from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for the frontend
    CORS(app)

    # Initialize MongoDB Client
    # We attach it to 'app.db' so any route can access the database easily
    client = MongoClient(app.config['MONGO_URI'])
    app.db = client.get_database()

    # Health Check Endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        # Check if the database is actually responding
        db_status = "connected" if client.admin.command('ping') else "disconnected"
        
        return jsonify({
            "status": "healthy", 
            "database": db_status,
            "message": "Taste the Best API is running with MongoDB!"
        }), 200

    # Registering the Products Blueprint
    from .routes.products import products_bp
    app.register_blueprint(products_bp, url_prefix='/api/products')
    
    return app