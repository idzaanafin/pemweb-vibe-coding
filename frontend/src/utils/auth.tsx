export function getToken() {
  return sessionStorage.getItem("token");
}

export function getUser() {
  const u = sessionStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
