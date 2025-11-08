import API from "./API";

export const checkSession = async () => {
  try {
    const res = await API.get("/session-check", { withCredentials: true });
    return res.data;
  } catch {
    return { logged_in: false };
  }
};
