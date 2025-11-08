import pandas as pd
import datetime
import io

class GLReportGenerator:
    def __init__(self, cleaned_data, anomalies, summary_stats,
                 gl_column="GL", amount_column="Amount", step=10_000_000):
        """
        cleaned_data : pandas.DataFrame
        anomalies : dict
        summary_stats : dict
        gl_column : column name for GL numbers
        amount_column : column for debit/credit amounts
        step : GL range step size (default 10,000,000)
        """
        self.cleaned_data = cleaned_data.copy()
        self.anomalies = anomalies or {}
        self.summary_stats = summary_stats or {}
        self.gl_column = gl_column
        self.amount_column = amount_column
        self.step = step
        self.extra_data = {}

    def generate_range_comparison(self):
        df = self.cleaned_data
        gl_col = self.gl_column
        amt_col = self.amount_column

        if gl_col not in df.columns or amt_col not in df.columns:
            raise ValueError(f"Columns '{gl_col}' or '{amt_col}' not found in data.")

        # Clean + ensure numeric
        df[gl_col] = pd.to_numeric(df[gl_col], errors="coerce")
        df[amt_col] = pd.to_numeric(df[amt_col], errors="coerce")
        df = df.dropna(subset=[gl_col, amt_col])

        # Define GL range bins
        step = self.step
        min_gl, max_gl = int(df[gl_col].min()), int(df[gl_col].max())
        min_bin = (min_gl // step) * step
        max_bin = ((max_gl + step - 1) // step) * step
        bins = list(range(min_bin, max_bin + step, step))
        labels = [f"{b:,} to {b + step - 1:,}" for b in bins[:-1]]

        df["GL_Range"] = pd.cut(df[gl_col], bins=bins, labels=labels, include_lowest=True)

        # Calculate positive & negative totals (absolute)
        df["Positive"] = df[amt_col].apply(lambda x: x if x > 0 else 0)
        df["Negative"] = df[amt_col].apply(lambda x: abs(x) if x < 0 else 0)

        grouped = (
            df.groupby("GL_Range", dropna=True)
              .agg(
                  Positive_Total=("Positive", "sum"),
                  Negative_Total=("Negative", "sum"),
                  Count=("GL_Range", "count")
              )
              .reset_index()
        )

        grouped = grouped[(grouped["Positive_Total"] > 0) | (grouped["Negative_Total"] > 0)]
        grouped["Lower_Bound"] = grouped["GL_Range"].apply(lambda x: int(str(x).split(" ")[0].replace(",", "")))
        grouped = grouped.sort_values("Lower_Bound")

        # Store for chart use
        self.extra_data["gl_range_comparison"] = grouped
        return grouped

    def generate_markdown(self):
        grouped = self.generate_range_comparison()

        md = io.StringIO()
        md.write("# 📊 GL-Based Positive vs Negative Amount Comparison Report\n\n")
        md.write(f"**Generated on:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

        md.write("## 🧾 Summary\n")
        md.write(f"- Total unique GL accounts: **{self.summary_stats.get('total_gl_accounts','N/A')}**\n")
        md.write(f"- Mean value: **{round(self.summary_stats.get('mean', 0), 4)}**\n")
        md.write(f"- Variance: **{round(self.summary_stats.get('variance', 0), 4)}**\n\n")
        md.write("---\n\n")

        md.write("## 📈 Positive vs Negative Totals per GL Range\n\n")
        md.write("| GL Range | Positive Total | Negative Total | Count |\n")
        md.write("|:----------|----------------:|----------------:|-------:|\n")
        for _, row in grouped.iterrows():
            md.write(f"| {row['GL_Range']} | {int(row['Positive_Total']):,} | {int(row['Negative_Total']):,} | {int(row['Count']):,} |\n")

        md.write("\n---\n\n")
        md.write("## 🧠 Observations\n")
        md.write("""
- GL ranges are grouped by account numbers in steps of 10,000,000.
- Each range shows total **positive** and **negative (absolute)** amounts recorded in that range.
- Compare visually to identify debit-heavy (red) or credit-heavy (green) GL segments.
- A balanced range shows similar positive/negative totals; large gaps may require reconciliation.
        """)

        return md.getvalue()
