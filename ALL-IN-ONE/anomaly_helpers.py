# anomaly_helpers.py
import pandas as pd
import numpy as np
from scipy import stats

def aggregate_by_gl(df, gl_col="GL", amount_col="Amount"):
    """
    Aggregate data by GL (sum positive/negative and count).
    Returns dataframe with columns: GL, Positive_Total, Negative_Total, Net, Count
    """
    df = df.copy()
    df[gl_col] = pd.to_numeric(df[gl_col], errors="coerce")
    df[amount_col] = pd.to_numeric(df[amount_col], errors="coerce")
    df = df.dropna(subset=[gl_col, amount_col])

    # per-row positive/negative
    df["Positive"] = df[amount_col].apply(lambda x: x if x > 0 else 0)
    df["Negative"] = df[amount_col].apply(lambda x: abs(x) if x < 0 else 0)

    agg = df.groupby(gl_col).agg(
        Positive_Total=("Positive", "sum"),
        Negative_Total=("Negative", "sum"),
        Net=("Positive", "sum"),  # net = positive - negative computed below
        Count=(amount_col, "count")
    ).reset_index()
    agg["Net"] = agg["Positive_Total"] - agg["Negative_Total"]
    return agg

def detect_zscore_anomalies(df, value_col="Net", threshold=3.0):
    """
    Detect anomalies using z-score on a numeric column (e.g. Net).
    Returns DataFrame of anomalies with zscore column.
    """
    s = df[value_col].astype(float).fillna(0)
    # if std=0 then no anomalies
    if s.std(ddof=0) == 0:
        df["zscore"] = 0.0
        return df[df["zscore"].abs() > threshold]
    z = (s - s.mean()) / s.std(ddof=0)
    df = df.copy()
    df["zscore"] = z
    return df[df["zscore"].abs() > threshold].sort_values("zscore", key=lambda x: x.abs(), ascending=False)

def detect_change_anomalies(curr_agg, prev_agg, gl_col="GL", min_abs_change=10000, min_pct_change=20.0):
    """
    Compare current and previous aggregated by GL.
    Returns DataFrame with:
      GL, curr_Pos, prev_Pos, diff_Pos, pct_change_Pos,
      curr_Neg, prev_Neg, diff_Neg, pct_change_Neg,
      curr_Net, prev_Net, diff_Net, pct_change_Net
    Flags row as anomaly if abs(diff_Net) >= min_abs_change OR abs(pct_change_Net) >= min_pct_change.
    """
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
                      left_on=gl_col, right_on=gl_col, how="outer").fillna(0)

    # diffs
    merged["diff_Pos"] = merged["curr_Pos"] - merged["prev_Pos"]
    merged["diff_Neg"] = merged["curr_Neg"] - merged["prev_Neg"]
    merged["diff_Net"] = merged["curr_Net"] - merged["prev_Net"]

    def pct_change(curr, prev):
        return np.where(prev == 0, np.nan, (curr - prev) / (abs(prev)) * 100.0)

    merged["pct_Pos"] = pct_change(merged["curr_Pos"], merged["prev_Pos"])
    merged["pct_Neg"] = pct_change(merged["curr_Neg"], merged["prev_Neg"])
    merged["pct_Net"] = pct_change(merged["curr_Net"], merged["prev_Net"])

    # flag anomalies
    merged["anomaly_flag"] = (
        (merged["diff_Net"].abs() >= min_abs_change) |
        (merged["pct_Net"].abs() >= min_pct_change)
    )

    # sort by largest absolute diff
    merged = merged.sort_values(by="diff_Net", key=lambda x: x.abs(), ascending=False)
    return merged

def summarize_anomalies(z_anoms, change_anoms):
    """
    Returns a small textual summary for display.
    """
    lines = []
    lines.append(f"- Z-score anomalies found: {len(z_anoms)}")
    lines.append(f"- Change anomalies found: {int(change_anoms['anomaly_flag'].sum())}")
    return "\n".join(lines)
