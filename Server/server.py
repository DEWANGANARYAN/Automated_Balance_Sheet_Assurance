from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import pandas as pd
import os
from datetime import datetime
from Team_Rocket_Modules.Agent import GLReportGenerator
from Team_Rocket_Modules.Process import GLAnalyzer
from bson import ObjectId

# -------------------- CONFIG --------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO")
api_key = os.getenv("KEY")

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default-secret")
CORS(app, supports_credentials=True)

client = MongoClient(MONGO_URI)
db = client["Finnovate"]
users_collection = db["users"]
reports_collection = db["reports"]
reviews_collection = db["reviews"]
reviews_collection.create_index("report_id")
reviews_collection.create_index("gl_code")
reviews_collection.create_index("username")
reviews_collection.create_index("status")


DATASET_FOLDER = "./Dataset"
os.makedirs(DATASET_FOLDER, exist_ok=True)


# -------------------- AUTH ROUTES --------------------
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
        session['username'] = username
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


# -------------------- EXCEL UPLOAD + ANALYSIS --------------------
@app.route('/upload-excel', methods=['POST'])
def upload_excel():
    """
    Upload Excel → Run GLAnalyzer & GLReportGenerator → Save Markdown path in DB + Return summary to frontend.
    """
    if 'file' not in request.files:
        return jsonify({"status": "fail", "message": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "fail", "message": "No file selected"}), 400

    if 'username' not in session:
        return jsonify({"status": "fail", "message": "User not logged in"}), 401

    try:
        # 1️⃣ Save uploaded file
        file_path = os.path.join(DATASET_FOLDER, file.filename)
        os.makedirs(DATASET_FOLDER, exist_ok=True)
        file.save(file_path)

        # 2️⃣ Read Excel data
        raw = pd.read_excel(file_path, skiprows=2)
        columns = raw.columns
        df = raw[columns[:7]]

        # 3️⃣ Run Analyzer to process GL data
        analyzer = GLAnalyzer(df)
        report_text = analyzer.run_analysis()

        fault = analyzer.getFault()

        # 4️⃣ Generate Markdown report file (returns .md file path)
        reporter = GLReportGenerator(api_key)
        report_path = reporter.generate_report(report_text, session['username'])
        report_filename = os.path.basename(report_path)

        # 6️⃣ Store metadata in MongoDB (same schema)
        username = session['username']
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        report_entry = {
            "username": username,
            "filename": file.filename,        # uploaded file name
            "report_filename": report_filename,  # generated markdown
            "report_path": report_path,       # path to file
            "uploaded_at": timestamp,
            "fault": fault,
        }

        result = reports_collection.insert_one(report_entry)
        report_id = str(result.inserted_id)

        # 7️⃣ Return metadata + preview to frontend
        return jsonify({
            "status": "success",
            "message": "Report generated successfully",
            "report_id": report_id,
            "username": username,
            "report_file": report_filename,
            "report_path": report_path
        }), 200

    except Exception as e:
        return jsonify({
            "status": "fail",
            "message": f"Error processing file: {str(e)}"
        }), 500


# -------------------- FETCH USER DASHBOARD REPORTS --------------------
@app.route('/user-reports', methods=['GET'])
def get_user_reports():
    """
    Fetch all reports generated by the logged-in user (dashboard preview).
    Returns summary info for each report.
    """
    if 'username' not in session:
        return jsonify({"status": "fail", "message": "User not logged in"}), 401

    username = session['username']
    reports = list(reports_collection.find({"username": username}, {"report": 0}))  # exclude full report text

    formatted_reports = []
    for r in reports:
        formatted_reports.append({
            "id": str(r["_id"]),
            # ✅ safe fallback for different key names
            "filename": (
                r.get("filename")
                or r.get("uploaded_filename")
                or r.get("report_filename")
                or "Unknown"
            ),
            # ✅ safe fallback if uploaded_at is missing
            "uploaded_at": r.get("uploaded_at", "Unknown")
        })
    return jsonify({
        "status": "success",
        "count": len(formatted_reports),
        "reports": formatted_reports
    }), 200


# -------------------- FETCH SINGLE REPORT (ON CLICK) --------------------
@app.route('/get-report/<report_id>', methods=['GET'])
def get_report_by_id(report_id):
    """
    Fetch and render a specific Markdown report by report_id.
    Returns Markdown content, fault dict, and metadata in JSON.
    """
    if 'username' not in session:
        return jsonify({"status": "fail", "message": "User not logged in"}), 401

    try:
        # ✅ 1. Find the report in MongoDB
        report = reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            return jsonify({"status": "fail", "message": "Report not found"}), 404

        # ✅ 2. Read the Markdown file from disk
        file_path = os.path.normpath(os.path.abspath(report.get("report_path", "")))
        if not os.path.exists(file_path):
            return jsonify({"status": "fail", "message": f"File not found at {file_path}"}), 404

        with open(file_path, "r", encoding="utf-8") as f:
            markdown_content = f.read()

        # ✅ 3. Build response JSON (includes fault)
        return jsonify({
            "status": "success",
            "markdown": markdown_content,
            "fault": report.get("fault", {}),  # 🧾 fault dict included here
            "meta": {
                "filename": report.get("filename"),
                "uploaded_at": report.get("uploaded_at")
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "fail",
            "message": f"Error fetching report file: {str(e)}"
        }), 500




@app.route('/request-review', methods=['POST'])
def request_review():
    """
    Create or update a review record for a specific GL code under a report.
    """
    data = request.get_json()
    report_id = data.get("report_id")
    gl_code = data.get("gl_code")
    gl_range = data.get("gl_range")
    remark = data.get("remark", "Inconsistency in Value")
    username = session.get("username", "unknown_user")

    if not report_id or not gl_code:
        return jsonify({"status": "fail", "message": "Missing report_id or gl_code"}), 400

    existing = reviews_collection.find_one({"report_id": report_id, "gl_code": gl_code})
    timestamp = datetime.utcnow().isoformat()

    if existing:
        # Already exists, just update status and append log
        reviews_collection.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "status": "waiting",
                    "last_updated": timestamp
                },
                "$push": {
                    "logs": {"timestamp": timestamp, "action": "ask_for_review", "by": username}
                }
            }
        )
    else:
        # New review entry
        review = {
            "report_id": report_id,
            "username": username,
            "gl_range": gl_range,
            "gl_code": gl_code,
            "remark": remark,
            "status": "waiting",
            "logs": [
                {"timestamp": timestamp, "action": "ask_for_review", "by": username}
            ],
            "review_image": None,
            "last_updated": timestamp
        }
        reviews_collection.insert_one(review)

    return jsonify({"status": "success", "gl_code": gl_code, "new_status": "waiting"}), 200




@app.route('/update-review-status', methods=['POST'])
def update_review_status():
    """
    Update review status (granted or rejected) for a GL code.
    """
    data = request.get_json()
    report_id = data.get("report_id")
    gl_code = data.get("gl_code")
    decision = data.get("decision")  # granted | rejected
    reviewer = session.get("username", "reviewer")

    timestamp = datetime.utcnow().isoformat()

    result = reviews_collection.update_one(
        {"report_id": report_id, "gl_code": gl_code},
        {
            "$set": {
                "status": decision,
                "last_updated": timestamp
            },
            "$push": {
                "logs": {"timestamp": timestamp, "action": decision, "by": reviewer}
            }
        }
    )

    if result.modified_count == 0:
        return jsonify({"status": "fail", "message": "Review not found"}), 404

    return jsonify({"status": "success", "decision": decision}), 200




@app.route('/review-log/<report_id>/<gl_code>', methods=['GET'])
def get_review_log(report_id, gl_code):
    """
    Fetch full review history for a GL code.
    """
    review = reviews_collection.find_one(
        {"report_id": report_id, "gl_code": int(gl_code)},
        {"_id": 0}
    )
    if not review:
        return jsonify({"status": "fail", "message": "No review found"}), 404

    return jsonify({
        "status": "success",
        "gl_code": gl_code,
        "logs": review.get("logs", []),
        "current_status": review.get("status", "unknown")
    }), 200



@app.route('/report-reviews/<report_id>', methods=['GET'])
def get_report_reviews(report_id):
    """
    Fetch all review statuses for a given report.
    """
    reviews = list(reviews_collection.find({"report_id": report_id}, {"_id": 0}))
    return jsonify({"status": "success", "count": len(reviews), "reviews": reviews}), 200




# -------------------- MAIN --------------------
if __name__ == '__main__':
    app.run(debug=True)
