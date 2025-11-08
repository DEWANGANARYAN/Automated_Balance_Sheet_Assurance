import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getSingleReport } from "../services/ReportService";
import {
  requestReview,
  updateReviewStatus,
  getReportReviews,
  getReviewLog,
} from "../services/ReviewService";

const ReportDetail = () => {
  const { id } = useParams(); // report_id
  const [markdown, setMarkdown] = useState("");
  const [faultData, setFaultData] = useState({});
  const [reviews, setReviews] = useState([]); // all review statuses
  const [showModal, setShowModal] = useState(false);
  const [activeGL, setActiveGL] = useState(null);
  const [reviewLogs, setReviewLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load the Markdown + Fault data + Review data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getSingleReport(id);

        // ✅ Ensure markdown is always a string
        const markdownText =
          typeof res.data === "string"
            ? res.data
            : res.data?.markdown || JSON.stringify(res.data, null, 2);
        setMarkdown(markdownText);

        // ✅ Populate fault data if available
        if (res.data?.fault) {
          const fault =
            typeof res.data.fault === "string"
              ? JSON.parse(res.data.fault)
              : res.data.fault;
          setFaultData(fault);
        }

        // ✅ Fetch existing review statuses
        const reviewRes = await getReportReviews(id);
        setReviews(reviewRes.data.reviews || []);
      } catch (err) {
        console.error("❌ Error fetching report:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // ✅ Get review status for a specific GL Code
  const getStatus = (glCode) => {
    const review = reviews.find((r) => r.gl_code === glCode);
    return review ? review.status : "action_needed";
  };

  // ✅ Ask for review
  const handleAskForReview = async (glCode, glRange) => {
    try {
      await requestReview(id, glCode, glRange);
      const reviewRes = await getReportReviews(id);
      setReviews(reviewRes.data.reviews || []);
    } catch (err) {
      console.error("❌ Failed to request review:", err);
    }
  };

  // ✅ Open modal to view review logs
  const openReviewModal = async (glCode) => {
    setActiveGL(glCode);
    setShowModal(true);
    try {
      const res = await getReviewLog(id, glCode);
      setReviewLogs(res.data.logs || []);
    } catch (err) {
      console.error("❌ Failed to load review log:", err);
    }
  };

  // ✅ Handle reviewer decision (approve/reject)
  const handleDecision = async (decision) => {
    if (!activeGL) return;
    try {
      await updateReviewStatus(id, activeGL, decision);
      const reviewRes = await getReportReviews(id);
      setReviews(reviewRes.data.reviews || []);
      setShowModal(false);
      setActiveGL(null);
    } catch (err) {
      console.error("❌ Failed to update review:", err);
    }
  };

  if (isLoading) return <p>Loading report...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h2>📘 GL Report</h2>
      <ReactMarkdown>{markdown}</ReactMarkdown>

      <h3 style={{ marginTop: "2rem" }}>🧾 GL Fault Summary</h3>
      <table
        border="1"
        cellPadding="8"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "center",
        }}
      >
        <thead style={{ background: "#f4f4f4" }}>
          <tr>
            <th>GL Range</th>
            <th>GL Code</th>
            <th>Remark</th>
            <th>Progress</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(faultData).length === 0 ? (
            <tr>
              <td colSpan="5">No fault data available</td>
            </tr>
          ) : (
            Object.entries(faultData).map(([range, codes]) =>
              (Array.isArray(codes) ? codes : []).map((code, index) => {
                const status = getStatus(code);
                return (
                  <tr key={`${range}-${code}-${index}`}>
                    {index === 0 && (
                      <td
                        rowSpan={codes.length}
                        style={{
                          fontWeight: "bold",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {range}
                      </td>
                    )}
                    <td>{code}</td>
                    <td>Inconsistency in Value</td>
                    <td>
                      {status === "waiting" && "⏳ Waiting"}
                      {status === "granted" && "✅ Granted"}
                      {status === "rejected" && "❌ Rejected"}
                      {status === "action_needed" && "⚠️ Action Needed"}
                    </td>
                    <td>
                      {status === "action_needed" && (
                        <button
                          onClick={() => handleAskForReview(code, range)}
                          style={buttonStyle.primary}
                        >
                          Ask for Review
                        </button>
                      )}
                      {status === "waiting" && <span>🕒 Awaiting Review</span>}
                      {(status === "granted" || status === "rejected") && (
                        <button
                          onClick={() => openReviewModal(code)}
                          style={buttonStyle.secondary}
                        >
                          Click to Check
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )
          )}
        </tbody>
      </table>

      {/* ✅ Modal for Review Check */}
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3>🔍 Review for GL Code: {activeGL}</h3>
            <div style={{ textAlign: "left", margin: "10px 0" }}>
              <h4>📜 Review Log</h4>
              {reviewLogs.length === 0 ? (
                <p>No logs yet</p>
              ) : (
                <ul>
                  {reviewLogs.map((log, idx) => (
                    <li key={idx}>
                      <strong>{log.action}</strong> by {log.by} at{" "}
                      {new Date(log.timestamp).toLocaleString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => handleDecision("granted")}
                style={{ ...buttonStyle.primary, marginRight: 10 }}
              >
                ✅ Grant
              </button>
              <button
                onClick={() => handleDecision("rejected")}
                style={buttonStyle.danger}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ ...buttonStyle.secondary, marginLeft: 10 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Button styles
const buttonStyle = {
  primary: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  secondary: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  danger: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

// ✅ Modal styles
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  content: {
    background: "#fff",
    borderRadius: "10px",
    padding: "20px",
    width: "500px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
};

export default ReportDetail;
