import google.generativeai as genai
import os
from datetime import datetime

class GLReportGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = self._configure_model()

    def _configure_model(self):
        genai.configure(api_key=self.api_key)
        return genai.GenerativeModel("gemini-2.5-flash")

    def generate_report(self, processed_gl_info: str, username: str) -> str:
        # 1️⃣ Build prompt and generate report text
        prompt = self._build_prompt(processed_gl_info)
        response = self.model.generate_content(prompt)
        markdown_text = response.text.strip()

        project_root = os.path.abspath(os.getcwd())
        base_dir = os.path.join(project_root, "Report", username)
        os.makedirs(base_dir, exist_ok=True)  # creates full folder chain if missing
        # 3️⃣ Create filename with timestamp
        filename = f"GL_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        file_path = os.path.abspath(os.path.join(base_dir, filename))  # ✅ ensure absolute path


        # 4️⃣ Write markdown content safely
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(markdown_text)
        except Exception as e:
            raise RuntimeError(f"❌ Error writing Markdown file: {e}")

        # 5️⃣ Return absolute file path
        return file_path

    def _build_prompt(self, processed_gl_info: str) -> str:
        return f"""
        You are a data reporting assistant.
        Convert the following processed GL data into a clean, formatted README.md report.
        Make sure the Markdown structure includes:
        - Title
        - Summary
        - Total GL Accounts
        - Statistics
        - Sign Anomalies
        - Z-Score Anomalies
        - Missing Data
        - Key Trends
        - Recommendations
        - Executive Summary
        ---
        Here is the processed GL data:
        {processed_gl_info}
        - No brackets in titles.
        - Use only provided GL info.
        - Percentages and interpretations are based on given data.
        - No extra text or code outside the Markdown.
        """
