from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO")

# Setup Flask and MongoDB
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default-secret")

CORS(app)
client = MongoClient(MONGO_URI)
db = client["Finnovate"]
users_collection = db["users"]




@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if users_collection.find_one({"username": username}):
        return jsonify({"status": "fail", "message": "User already exists"}), 409

    users_collection.insert_one({"username": username, "password": password})
    return jsonify({"status": "success", "message": "Signup successful"}), 201




@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = users_collection.find_one({"username": username, "password": password})
    if user:
        session['username'] = username  # Store user in session
        return jsonify({"status": "success", "message": "Login successful"}), 200
    else:
        return jsonify({"status": "fail", "message": "Invalid credentials"}), 401




@app.route('/session-check', methods=['GET'])
def session_check():
    if 'username' in session:
        return jsonify({"logged_in": True, "username": session['username']})
    else:
        return jsonify({"logged_in": False})




@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({"status": "success", "message": "Logged out"}), 200






if __name__ == '__main__':
    app.run(debug=True)
