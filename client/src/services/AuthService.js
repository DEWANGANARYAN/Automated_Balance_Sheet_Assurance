import API from "./API";

export const signup = async (data) => {
  return API.post("/signup", data);
};

export const signin = async (data) => {
  return API.post("/signin", data);
};

export const logout = async () => {
  return API.post("/logout");
};

export const sessionCheck = async () => {
  return API.get("/session-check");
};
