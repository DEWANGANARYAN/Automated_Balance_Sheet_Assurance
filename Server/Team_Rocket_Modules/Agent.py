import google.generativeai as genai

class GLReportGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = self._configure_model()

    def _configure_model(self):
        genai.configure(api_key=self.api_key)
        return genai.GenerativeModel("gemini-2.5-flash")

    def generate_report(self, processed_gl_info: str) -> str:
        prompt = self._build_prompt(processed_gl_info)
        response = self.model.generate_content(prompt)
        return response.text

    def _build_prompt(self, gl_info: str) -> str:
        intro = """
You are a financial data reporting assistant.
You will be given processed information about a GL (General Ledger) dataset from Excel.  
Use ONLY the given information — do not assume or invent any data.  
Generate a structured JSON report using the exact format and titles shown below.  
Do not include any text outside JSON.  
Ensure the JSON keys and order remain identical in every response.
PROCESSED GL INFO:
"""
        structure = """
Now generate the JSON report with the following structure and section titles:
{
  "1": {
    "title": "Title / Summary",
    "content": "GL Data Quality & Anomaly Summary (based on provided context). Total unique GL accounts: ..."
  },
  "2": {
    "title": "Total GL account",
    "content": "..."
  },
  "3": {
    "title": "Variance and descriptive statistics",
    "content": {
      "Mean": "...",
      "Median": "...",
      "Standard Deviation": "...",
      "Variance": "...",
      "Interpretation": "..."
    }
  },
  "4": {
    "title": "Mismatch or sign anomalies by GL ranges",
    "Current Assets": {
      "Expected": "Positive",
      "Fault Count": "...",
      "Fault GLs": ["..."],
      "Fraction of Total": "..."
    },
    "Current Liabilities": {
      "Expected": "Positive",
      "Fault Count": "...",
      "Fault GLs": ["..."],
      "Fraction of Total": "..."
    },
    "Equity": {
      "Expected": "Negative",
      "Fault Count": "...",
      "Fault GLs": ["..."],
      "Fraction of Total": "..."
    },
    "Income": {
      "Expected": "Negative",
      "Fault Count": "...",
      "Fault GLs": ["..."],
      "Fraction of Total": "..."
    },
    "Expenses": {
      "Expected": "Positive",
      "Fault Count": "...",
      "Fault GLs": ["..."],
      "Fraction of Total": "..."
    }
  },
  "5": {
    "title": "Z-score anomalies",
    "Z_scores": {
      "11316920": 3.3959437759932625,
      "12202000": 17.956130417518832,
      "12222000": -5.186198400471039,
      "34100800": -3.1782803448240413,
      "34100900": -12.667599499887453
    },
    "Interpretation": "..."
  },
  "6": {
    "title": "Missing data",
    "content": "..."
  },
  "7": {
    "title": "Key trends and immediate observations",
    "points": [
      "...",
      "...",
      "..."
    ]
  },
  "8": {
    "title": "Actionable recommendations",
    "points": [
      "...",
      "...",
      "..."
    ]
  },
  "9": {
    "title": "Short executive summary",
    "points": [
      "...",
      "...",
      "..."
    ]
  }
}
Ensure:
- JSON is valid and machine-readable.
- No brackets in titles.
- Content uses only the provided GL info.
- Percentages and interpretations are calculated from the given data.
- No text outside JSON.
"""
        return intro + gl_info + structure
