import toast from "react-hot-toast";
import { api } from "./api";

export const errMsg = (e) => e.response?.data?.message || "Terjadi kesalahan, coba lagi";

// Convert object -> FormData (File / File[] / JSON-able values)
export const toForm = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((i) => fd.append(k, i));
    else fd.append(k, v);
  });
  return fd;
};

// Run a request with toast feedback. Returns data or null on failure.
export const request = async (method, url, body, { success = true } = {}) => {
  try {
    const { data } = await api({ method, url, data: body });
    if (success && data.message) toast.success(data.message);
    return data;
  } catch (e) {
    toast.error(errMsg(e));
    return null;
  }
};
