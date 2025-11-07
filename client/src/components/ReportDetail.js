import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSingleReport } from "../services/ReportService";
import ReactMarkdown from "react-markdown";

const ReportDetail = () => {
  const { id } = useParams();
  const [readmeContent, setReadmeContent] = useState("");
  const [meta, setMeta] = useState({ filename: "", uploaded_at: "" });

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await getSingleReport(id);
        const mdText = res.data; // ✅ directly use response text

        setReadmeContent(mdText);
        setMeta({
          uploaded_at: new Date().toLocaleString(),
        });

        console.log("✅ Markdown received:", mdText);
      } catch (error) {
        console.error("❌ Error fetching report:", error);
      }
    }

    fetchReport();
  }, [id]);

  if (!readmeContent) return <p>Loading...</p>;

  return (
    <div className="report-detail" style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <p><strong>Uploaded at:</strong> {meta.uploaded_at}</p>

      <h3>📘 Markdown Report</h3>
      <div className="markdown-content" style={{ whiteSpace: "normal" }}>
        <ReactMarkdown>{readmeContent}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ReportDetail;
