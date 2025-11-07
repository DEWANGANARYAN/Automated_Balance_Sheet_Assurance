import React, { useEffect, useState } from "react";
import { getUserReports, uploadExcel } from "../services/ReportService";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await getUserReports();
      setReports(res.data.reports);
      console.log("📊 Existing reports fetched:", res.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn("⚠️ No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadExcel(formData);
      setMessage(res.data.message);
      console.log("✅ Report generated successfully!");
      console.log("Report ID:", res.data.report_id);
      console.log("📄 Full Report JSON:", res.data.report);
      fetchReports();
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Your Reports</h2>

      <div className="upload-section">
        <input
          type="file"
          id="file-upload"
          className="file-input"
          onChange={(e) => {
            setFile(e.target.files[0]);
            console.log("📁 File selected:", e.target.files[0]?.name);
          }}
        />
        <button className="btn-upload" onClick={handleUpload}>Upload Excel</button>
        {message && <p className="upload-message">{message}</p>}
      </div>

      <ul className="reports-list">
        {reports.map((r) => (
          <li key={r.id} className="report-item">
            <Link to={`/report/${r.id}`} className="report-link">{r.filename}</Link>
            <span className="upload-date">{r.uploaded_at}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;



// import React, { useEffect, useState } from "react";
// import { getUserReports, uploadExcel } from "../services/ReportService";
// import { Link } from "react-router-dom";

// const Dashboard = () => {
//   const [reports, setReports] = useState([]);
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     fetchReports();
//   }, []);

//   const fetchReports = async () => {
//     const res = await getUserReports();
//     setReports(res.data.reports);
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     const formData = new FormData();
//     formData.append("file", file);
//     try {
//       const res = await uploadExcel(formData);
//       setMessage(res.data.message);
//       fetchReports();
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Upload failed");
//     }
//   };

//   return (
//     <div className="dashboard">
//       <h2>Your Reports</h2>

//       <div className="upload-section">
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//         <button onClick={handleUpload}>Upload Excel</button>
//         {message && <p>{message}</p>}
//       </div>

//       <ul>
//         {reports.map((r) => (
//           <li key={r.id}>
//             <Link to={`/report/${r.id}`}>{r.filename}</Link> — {r.uploaded_at}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Dashboard;
