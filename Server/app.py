import os
from pymongo import MongoClient

# ✅ Load environment variables
MONGO_URI = "mongodb://127.0.0.1:27017/?"

# ✅ Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["Finnovate"]  # or your DB name
users_collection = db["users"]

DEFAULT_PASSWORD = "123123"

import pandas as pd

df = pd.read_excel("Server\\Dataset\\data.xlsx", skiprows=2)
# Extract all GL codes (drop duplicates & NaN)
gl_codes = df['GL'].dropna().unique()

total_created = 0
total_skipped = 0

for gl_code in gl_codes:
    username = str(gl_code).strip()  # ensure it's a clean string

    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        total_skipped += 1
        continue

    # ✅ Insert into MongoDB
    users_collection.insert_one({
        "username": username,
        "password": DEFAULT_PASSWORD,
    })
    total_created += 1

print(f"✅ Done! Created {total_created} users. Skipped {total_skipped} existing ones.")


# from Team_Rocket_Modules.Agent import GLReportGenerator
# from Team_Rocket_Modules.Process import GLAnalyzer
# from dotenv import load_dotenv
# import pandas as pd
# import os

# load_dotenv()
# api_key = os.getenv("MONGO")

# raw = pd.read_excel("./Dataset/data.xlsx", skiprows=2)
# columns = raw.columns
# df = raw[columns[:7]]

# analyzer = GLAnalyzer(df)
# report_text = analyzer.run_analysis()
# reporter = GLReportGenerator(api_key)
# json_report = reporter.generate_report(report_text)

# # print(json_report)
# print(json_report[8:-4])