import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";
import { askQuestion, uploadPDF } from "./api";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Ref for chat scroll
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, fileId]);

  const colors = darkMode
  ? {
      bg: "#18181b",
      card: "#23232b",
      header: "#27272a",
      text: "#f3f4f6",
      accent: "#6366f1",
      error: "#f87171",
      success: "#4ade80",
      input: "#27272a",
      border: "#333",
      chatText: "#fff", // Chat bubble text color for dark mode
    }
  : {
      bg: "#f3f4f6",
      card: "#fff",
      header: "#e5e7eb",
      text: "#18181b",
      accent: "#6366f1",
      error: "#dc2626",
      success: "#16a34a",
      input: "#e5e7eb",
      border: "#d1d5db",
      chatText: "#18181b", // Chat bubble text color for light mode (black)
    };

  const handleUpload = async () => {
    setError("");
    setSuccess("");
    if (!pdfFile) {
      setError("Please select a PDF.");
      return;
    }
    setLoading(true);
    try {
      const data = await uploadPDF(pdfFile, userToken);
      setFileId(data.file_id);
      setSuccess("PDF uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  const handleAsk = async () => {
    setError("");
    setSuccess("");
    if (!question) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    try {
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      const data = await askQuestion(question, fileId, userToken);
      setAnswer(data.answer);
      setMessages((prev) => [...prev, { role: "bot", content: data.answer }]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setError("Error getting answer. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: colors.bg,
        color: colors.text,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: 0,
        margin: 0,
        transition: "background 0.3s, color 0.3s",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          width: "100vw",
          background: colors.header,
          padding: "1rem 0",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "2rem",
          letterSpacing: "1px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        ChatUrPDF
        <button
          aria-label="Toggle dark mode"
          onClick={() => setDarkMode((d) => !d)}
          style={{
            position: "absolute",
            right: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: colors.text,
            fontSize: "1.5rem",
            cursor: "pointer",
            transition: "color 0.3s",
          }}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>
      </header>

      <main
        style={{
          flex: 1,
          width: "100vw",
          maxWidth: "700px",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "center",
          padding: "1rem",
          boxSizing: "border-box",
          transition: "background 0.3s, color 0.3s",
          minHeight: 0, // allow children to shrink
        }}
      >
        <div style={{
          width: "100%",
          maxWidth: 700,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0, // allow chat to shrink
        }}>
          {!userToken && (
            <div style={{ margin: "2rem auto", textAlign: "center" }}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  setUserToken(credentialResponse.credential);
                }}
                onError={() => {
                  setError("Google Login Failed");
                }}
              />
              {error && (
                <div
                  style={{
                    marginTop: "1rem",
                    color: colors.error,
                    background: colors.card,
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {userToken && (
            <>
              <div
                style={{
                  margin: "1rem 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <label
                  htmlFor="pdf-upload"
                  style={{
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: "0.25rem",
                  }}
                >
                  Upload your PDF (max 10 pages)
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  style={{
                    background: colors.input,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "6px",
                    padding: "0.5rem",
                    fontSize: "1rem",
                    width: "100%",
                    maxWidth: "100%",
                    transition: "background 0.3s, color 0.3s",
                  }}
                />
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  style={{
                    background: colors.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1.5rem",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: "0.5rem",
                    fontSize: "1rem",
                    width: "fit-content",
                    alignSelf: "flex-end",
                    transition: "background 0.3s",
                  }}
                >
                  {loading ? "Uploading..." : "Upload PDF"}
                </button>
                {error && (
                  <div
                    style={{
                      color: colors.error,
                      background: colors.card,
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                    }}
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    style={{
                      color: colors.success,
                      background: colors.card,
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                    }}
                  >
                    {success}
                  </div>
                )}
              </div>

              {fileId && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    maxHeight: "60vh",
                    background: colors.card,
                    borderRadius: "12px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    transition: "background 0.3s, color 0.3s",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      minHeight: 0,
                      marginBottom: "0.5rem",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {messages.length === 0 && (
                      <div style={{ color: "#a1a1aa", textAlign: "center" }}>
                        Start chatting about your PDF!
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                             background: msg.role === "user" ? colors.accent : colors.input,
                            // Use black text for bot answers in light mode, white in dark mode
                            color:
                              !darkMode && msg.role === "bot"
                                ? "#18181b"
                                : colors.chatText,
                            padding: "0.75rem 1rem",
                            borderRadius: "16px",
                            maxWidth: "75%",
                            wordBreak: "break-word",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            fontSize: "1rem",
                            transition: "background 0.3s, color 0.3s",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!loading) handleAsk();
                    }}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      width: "100%",
                      background: "transparent",
                      position: "relative",
                    }}
                  >
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about the PDF"
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        background: colors.input,
                        color: colors.text,
                        fontSize: "1rem",
                        transition: "background 0.3s, color 0.3s",
                      }}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !question}
                      style={{
                        background: colors.accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: "16px",
                        padding: "0.75rem 1.5rem",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        transition: "background 0.3s",
                      }}
                    >
                      {loading ? "Thinking..." : "Send"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <footer
        style={{
          width: "100vw",
          background: colors.bg,
          color: "#a1a1aa",
          textAlign: "center",
          padding: "1rem 0",
          fontSize: "1rem",
        }}
      >
        © {new Date().getFullYear()} ChatUrPDF
      </footer>
      <style>
        {`
          html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          @media (max-width: 900px) {
            main {
              max-width: 98vw !important;
            }
          }
          @media (max-width: 600px) {
            main {
              max-width: 100vw !important;
              padding: 0.5rem !important;
            }
            input, button {
              font-size: 0.95rem !important;
              padding: 0.5rem 1rem !important;
            }
          }
          @media (max-width: 400px) {
            main {
              padding: 0.25rem !important;
            }
            input, button {
              font-size: 0.85rem !important;
              padding: 0.4rem 0.7rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;