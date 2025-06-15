import axios from "axios";

const BASE_URL = "http://localhost:8000"; // Replace with your FastAPI endpoint

export const uploadPDF = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${BASE_URL}/upload/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const askQuestion = async (question, fileId, token) => {
  const res = await axios.post(
    `${BASE_URL}/ask/`,
    {
      question,
      file_id: fileId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};