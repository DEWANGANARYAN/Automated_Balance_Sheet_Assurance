import React, { useEffect, useState } from "react";
import { getMyReviews, submitReviewProof } from "../services/ReviewService";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const res = await getMyReviews();
    setReviews(res.data.reviews || []);
  };

  const openModal = (review) => {
    setActiveReview(review);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("text", text);
    if (file) formData.append("file", file);
    await submitReviewProof(activeReview._id, formData);
    setShowModal(false);
    loadReviews();
  };

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>📋 My Assigned Reviews</h2>
      {reviews.length === 0 ? (
        <p>No pending reviews.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", textAlign: "center" }}>
          <thead>
            <tr>
              <th>GL Code</th>
              <th>Range</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id}>
                <td>{r.gl_code}</td>
                <td>{r.gl_range}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === "waiting" && (
                    <button onClick={() => openModal(r)}>Submit Proof</button>
                  )}
                  {r.status === "submitted" && <span>📤 Submitted</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div style={modal.overlay}>
          <div style={modal.content}>
            <h3>Submit Proof for GL {activeReview.gl_code}</h3>
            <textarea
              placeholder="Enter text proof"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ width: "100%", height: "80px", marginBottom: "10px" }}
            />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <div style={{ marginTop: "10px" }}>
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modal = {
  overlay: {
    position: "fixed", top: 0, left: 0,
    width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  content: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  },
};

export default MyReviews;
