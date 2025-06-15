import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { askQuestion, uploadPDF } from "./api";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState("");

  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF.");
    setLoading(true);
    try {
      const data = await uploadPDF(pdfFile, userToken);
      setFileId(data.file_id);
      alert("PDF uploaded successfully.");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const data = await askQuestion(question, fileId, userToken);
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      alert("Error getting answer.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📄 PDF Q&A</h1>

      {!userToken && (
        <div style={{ marginBottom: "2rem" }}>
          <GoogleLogin
            onSuccess={credentialResponse => {
              setUserToken(credentialResponse.credential);
            }}
            onError={() => {
              alert("Google Login Failed");
            }}
          />
        </div>
      )}

      {userToken && (
        <>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <button onClick={handleUpload} disabled={loading}>
            Upload PDF
          </button>

          {fileId && (
            <>
              <div style={{ marginTop: "2rem" }}>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about the PDF"
                  style={{ width: "60%" }}
                />
                <button onClick={handleAsk} disabled={loading}>
                  Ask
                </button>
              </div>

              {answer && (
                <div style={{ marginTop: "1rem" }}>
                  <h3>💬 Answer:</h3>
                  <p>{answer}</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;