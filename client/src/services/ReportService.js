import API from "./API";

export const uploadExcel = async (formData) => {
  return API.post("/upload-excel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getUserReports = async () => {
  return API.get("/user-reports");
};

export const getSingleReport = async (id) => {
  return API.get(`/get-report/${id}`);
};
