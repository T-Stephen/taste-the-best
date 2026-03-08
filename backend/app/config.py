import os

class Config:
    # Secret key for JWT Authentication
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-pro-key-for-dev')
    
    # MongoDB Cloud Connection String
    # (We will put your real MongoDB Atlas connection string here soon)
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/tastethebest')