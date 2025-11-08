import pandas as pd
import numpy as np

class GLAnalyzer:
    def __init__(self, df):
        self.df = df

    def run(self):
        df = self.df.copy()
        
        # Clean missing data
        df = df.dropna(how='all')

        # Basic summary
        summary_stats = {
            "total_gl_accounts": df["GL"].nunique() if "GL" in df.columns else 0,
            "mean": float(df.select_dtypes(include=[np.number]).mean().mean()),
            "variance": float(df.select_dtypes(include=[np.number]).var().mean()),
        }

        # Anomaly detection using z-score
        anomalies = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df[f"Z_{col}"] = (df[col] - df[col].mean()) / df[col].std(ddof=0)
            anomalies[col] = df[df[f"Z_{col}"].abs() > 3][["GL", col, f"Z_{col}"]].to_dict(orient="records")

        return df, anomalies, summary_stats
