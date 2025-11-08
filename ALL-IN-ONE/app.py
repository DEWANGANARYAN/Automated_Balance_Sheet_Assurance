import streamlit as st
import pandas as pd
import numpy as np
import altair as alt
from pymongo import MongoClient
from io import BytesIO
from scipy import stats

# -------------------- CONFIG --------------------
st.set_page_config(page_title="GL Analyzer - Anomaly & Category Visualizer", layout="wide")
st.title("📊 GL Analyzer — Category-Based Anomaly Detection Dashboard")

# -------------------- HELPERS --------------------

def aggregate_by_gl(df, gl_col="GL", amount_col="Amount"):
    """
    Group GL accounts by their leading digit (1-9) and aggregate totals.
    """
    df = df.copy()
    df[gl_col] = pd.to_numeric(df[gl_col], errors="coerce").astype("Int64")
    df[amount_col] = pd.to_numeric(df[amount_col], errors="coerce")
    df = df.dropna(subset=[gl_col, amount_col])

    # extract leading digit
    df["GL_Group"] = df[gl_col].astype(str).str[0]
    df = df[df["GL_Group"].notna()]
    df["GL_Group"] = pd.to_numeric(df["GL_Group"], errors="coerce").astype("Int64")

    # business-friendly labels
    labels = {
        1: "Assets",
        2: "Liabilities",
        3: "Equity",
        4: "Revenue",
        5: "Expenses",
        6: "Cost of Goods Sold",
        7: "Other Income",
        8: "Other Expenses",
        9: "Adjustments"
    }
    df["Group_Name"] = df["GL_Group"].map(labels).fillna("Unknown")

    df["Positive"] = df[amount_col].apply(lambda x: x if x > 0 else 0)
    df["Negative"] = df[amount_col].apply(lambda x: abs(x) if x < 0 else 0)

    grouped = (
        df.groupby(["GL_Group", "Group_Name"], dropna=True)
        .agg(
            Positive_Total=("Positive", "sum"),
            Negative_Total=("Negative", "sum"),
            Count=(amount_col, "count")
        )
        .reset_index()
        .sort_values("GL_Group")
    )
    grouped["Net"] = grouped["Positive_Total"] - grouped["Negative_Total"]
    return grouped


def detect_zscore_anomalies(df, value_col="Net", threshold=3.0):
    s = df[value_col].astype(float).fillna(0)
    if s.std(ddof=0) == 0:
        df["zscore"] = 0.0
        return df[df["zscore"].abs() > threshold]
    df["zscore"] = (s - s.mean()) / s.std(ddof=0)
    return df[df["zscore"].abs() > threshold].sort_values("zscore", key=lambda x: x.abs(), ascending=False)


def detect_change_anomalies(curr_agg, prev_agg, gl_col="GL_Group", min_abs_change=10000, min_pct_change=20.0):
    left = curr_agg.rename(columns={
        "Positive_Total": "curr_Pos",
        "Negative_Total": "curr_Neg",
        "Net": "curr_Net",
        "Count": "curr_Count"
    })
    right = prev_agg.rename(columns={
        "Positive_Total": "prev_Pos",
        "Negative_Total": "prev_Neg",
        "Net": "prev_Net",
        "Count": "prev_Count"
    })
    merged = pd.merge(left, right[[gl_col, "prev_Pos", "prev_Neg", "prev_Net", "prev_Count"]],
                      on=gl_col, how="outer").fillna(0)
    merged["diff_Net"] = merged["curr_Net"] - merged["prev_Net"]

    def pct_change(curr, prev):
        return np.where(prev == 0, np.nan, (curr - prev) / abs(prev) * 100.0)
    merged["pct_Net"] = pct_change(merged["curr_Net"], merged["prev_Net"])

    merged["anomaly_flag"] = (
        (merged["diff_Net"].abs() >= min_abs_change) |
        (merged["pct_Net"].abs() >= min_pct_change)
    )
    return merged.sort_values(by="diff_Net", key=lambda x: x.abs(), ascending=False)


def save_snapshot_to_db(conn_str, dbname, collname, doc):
    client = MongoClient(conn_str)
    db = client[dbname]
    db[collname].insert_one(doc)


def load_latest_snapshot(conn_str, dbname, collname):
    client = MongoClient(conn_str)
    db = client[dbname]
    return db[collname].find_one(sort=[("_id", -1)])


# -------------------- SIDEBAR --------------------
st.sidebar.header("Data Input")
uploaded_file = st.sidebar.file_uploader("Upload current GL Excel/CSV", type=["xlsx", "xls", "csv"])
use_prev_from_db = st.sidebar.checkbox("Load previous snapshot from MongoDB", value=True)
mongo_conn_string = st.sidebar.text_input("MongoDB URI", value="mongodb://127.0.0.1:27017/")
mongo_dbname = st.sidebar.text_input("DB name", value="gl_reports_db")
mongo_collection = st.sidebar.text_input("Collection", value="snapshots")

st.sidebar.header("Anomaly thresholds")
z_thresh = st.sidebar.number_input("Z-score threshold", value=3.0, step=0.5)
min_abs_change = st.sidebar.number_input("Min absolute net change", value=10000, step=1000)
min_pct_change = st.sidebar.number_input("Min % net change", value=20.0, step=1.0)

# -------------------- MAIN --------------------
if uploaded_file is None:
    st.info("📂 Please upload a current GL file to start analysis.")
    st.stop()

# read uploaded data
if uploaded_file.name.endswith(('.xls', '.xlsx')):
    df_curr = pd.read_excel(uploaded_file)
else:
    df_curr = pd.read_csv(uploaded_file)

st.subheader("📄 Current Data Preview")
st.dataframe(df_curr.head())

if st.button("🔍 Run Analysis"):
    with st.spinner("Analyzing and grouping data..."):
        curr_agg = aggregate_by_gl(df_curr, gl_col="GL", amount_col="Amount")
        st.success("Aggregation complete.")
        st.subheader("📘 Aggregated by Leading Digit (GL Group)")
        st.dataframe(curr_agg)

        # Load previous snapshot if available
        prev_agg = None
        if use_prev_from_db:
            try:
                prev_doc = load_latest_snapshot(mongo_conn_string, mongo_dbname, mongo_collection)
                if prev_doc and "agg" in prev_doc:
                    prev_agg = pd.DataFrame(prev_doc["agg"])
                    st.info("✅ Loaded previous snapshot from MongoDB.")
            except Exception as e:
                st.warning(f"Could not load previous snapshot: {e}")

        # allow manual upload if no DB snapshot
        if prev_agg is None:
            prev_upload = st.file_uploader("Upload previous snapshot (CSV)", type=["csv"])
            if prev_upload:
                prev_agg = pd.read_csv(prev_upload)

        # ---------------- ANOMALY DETECTION ----------------
        z_anoms = detect_zscore_anomalies(curr_agg, value_col="Net", threshold=z_thresh)
        st.subheader("⚠️ Z-Score Anomalies (Current Data)")
        if z_anoms.empty:
            st.info("No z-score anomalies found.")
        else:
            st.dataframe(z_anoms)

        change_df, flagged = None, pd.DataFrame()
        if prev_agg is not None:
            change_df = detect_change_anomalies(curr_agg, prev_agg, gl_col="GL_Group",
                                                min_abs_change=min_abs_change,
                                                min_pct_change=min_pct_change)
            flagged = change_df[change_df["anomaly_flag"] == True]
            st.subheader("🔁 Change Anomalies (vs Previous Snapshot)")
            if flagged.empty:
                st.info("No significant changes detected.")
            else:
                st.dataframe(flagged)

        # ---------------- VISUALIZATIONS ----------------
        st.header("📊 Visualizations")

        # (1) Bar chart Positive vs Negative totals
        long_df = curr_agg.melt(id_vars=["GL_Group", "Group_Name"],
                                value_vars=["Positive_Total", "Negative_Total"],
                                var_name="Type", value_name="Total")
        long_df["Type"] = long_df["Type"].map({
            "Positive_Total": "Positive (Sum)",
            "Negative_Total": "Negative (Abs Sum)"
        })
        chart = alt.Chart(long_df).mark_bar().encode(
            x=alt.X("Group_Name:N", title="GL Group"),
            y=alt.Y("Total:Q", title="Total Amount"),
            color=alt.Color("Type:N", scale=alt.Scale(range=["#22c55e", "#ef4444"])),
            tooltip=["Group_Name", "Type", alt.Tooltip("Total:Q", format=",")]
        ).properties(width=800, height=400, title="Positive vs Negative Totals by GL Group")
        st.altair_chart(chart, use_container_width=True)

        # (2) Net bar chart
        net_chart = alt.Chart(curr_agg).mark_bar().encode(
            x=alt.X("Group_Name:N", title="GL Group"),
            y=alt.Y("Net:Q", title="Net Balance"),
            color=alt.condition(alt.datum.Net > 0, alt.value("#16a34a"), alt.value("#ef4444")),
            tooltip=["Group_Name", alt.Tooltip("Net:Q", format=",")]
        ).properties(width=800, height=350, title="Net Balance per GL Group")
        st.altair_chart(net_chart, use_container_width=True)

        # (3) Pie chart for group contribution
        st.subheader("🧩 Contribution to Total Net (Pie Chart)")
        pie_data = curr_agg.copy()
        pie_data["Net_Abs"] = pie_data["Net"].abs()
        pie = alt.Chart(pie_data).mark_arc(innerRadius=70).encode(
            theta=alt.Theta("Net_Abs:Q", title="Absolute Net"),
            color=alt.Color("Group_Name:N", legend=alt.Legend(title="GL Group")),
            tooltip=["Group_Name", alt.Tooltip("Net:Q", format=",")]
        ).properties(width=500, height=400)
        st.altair_chart(pie, use_container_width=True)

        # (4) If previous exists, show diff chart
        if prev_agg is not None:
            st.subheader("📈 Change Comparison (Current vs Previous)")
            diff_chart = alt.Chart(change_df).mark_bar().encode(
                x=alt.X("Group_Name:N", title="GL Group"),
                y=alt.Y("diff_Net:Q", title="Net Change"),
                color=alt.condition(alt.datum.diff_Net > 0, alt.value("#16a34a"), alt.value("#ef4444")),
                tooltip=["Group_Name", alt.Tooltip("diff_Net:Q", format=","), alt.Tooltip("pct_Net:Q", format=".2f")]
            ).properties(width=800, height=400)
            st.altair_chart(diff_chart, use_container_width=True)

        # ---------------- SAVE SNAPSHOT ----------------
        st.header("💾 Save Snapshot")
        if st.button("Save current grouped snapshot to MongoDB"):
            try:
                doc = {
                    "agg": curr_agg.to_dict(orient="records"),
                    "timestamp": pd.Timestamp.now().isoformat()
                }
                save_snapshot_to_db(mongo_conn_string, mongo_dbname, mongo_collection, doc)
                st.success("Snapshot saved successfully to MongoDB.")
            except Exception as e:
                st.error(f"Failed to save snapshot: {e}")

        # ---------------- DOWNLOAD FLAGGED ----------------
        if prev_agg is not None and not flagged.empty:
            csv_buf = flagged.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="⬇️ Download Flagged GL Groups (CSV)",
                data=csv_buf,
                file_name="flagged_gl_groups.csv",
                mime="text/csv"
            )
