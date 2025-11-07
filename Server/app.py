from Team_Rocket_Modules.Agent import GLReportGenerator
from Team_Rocket_Modules.Process import GLAnalyzer
from dotenv import load_dotenv
import pandas as pd
import os

load_dotenv()
api_key = os.getenv("KEY")

raw = pd.read_excel("./Dataset/data.xlsx", skiprows=2)
columns = raw.columns
df = raw[columns[:7]]

analyzer = GLAnalyzer(df)
report_text = analyzer.run_analysis()
reporter = GLReportGenerator(api_key)
json_report = reporter.generate_report(report_text)

# print(json_report)
print(json_report[8:-4])