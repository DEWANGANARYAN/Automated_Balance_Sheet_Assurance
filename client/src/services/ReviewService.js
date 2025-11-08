import API from "./API";

// Ask for review (user clicks "Ask for Review")
export const requestReview = async (reportId, glCode, glRange, remark = "Inconsistency in Value") => {
  return API.post("/request-review", {
    report_id: reportId,
    gl_code: glCode,
    gl_range: glRange,
    remark,
  });
};

// Reviewer approves or rejects
export const updateReviewStatus = async (reportId, glCode, decision) => {
  return API.post("/update-review-status", {
    report_id: reportId,
    gl_code: glCode,
    decision, // "granted" or "rejected"
  });
};

// Get full logs for a specific GL code
export const getReviewLog = async (reportId, glCode) => {
  return API.get(`/review-log/${reportId}/${glCode}`);
};

// Get all reviews for a given report
export const getReportReviews = async (reportId) => {
  return API.get(`/report-reviews/${reportId}`);
};
