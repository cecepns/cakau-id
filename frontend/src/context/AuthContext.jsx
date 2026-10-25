import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      setUser(data.data);
    } catch {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    refresh();

    // Auto-refresh saat window/tab kembali aktif
    const onFocus = () => {
      if (localStorage.getItem("token")) refresh();
    };
    window.addEventListener("focus", onFocus);

    // Auto-refresh berkala (setiap 20 detik) saat tab terlihat
    // agar mutasi saldo dari pesanan yang diselesaikan langsung tampil di layar penjual & kurir
    const interval = setInterval(() => {
      if (
        localStorage.getItem("token") &&
        document.visibilityState === "visible"
      ) {
        refresh();
      }
    }, 20000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [refresh]);

  const login = (token, u) => {
    localStorage.setItem("token", token);
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
