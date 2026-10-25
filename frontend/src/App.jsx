import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { Spinner } from "@/components/ui";
import Landing from "@/pages/Landing";
import ProductCatalog from "@/pages/ProductCatalog";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Users from "@/pages/admin/Users";
import Categories from "@/pages/admin/Categories";
import AdminSettings from "@/pages/admin/Settings";
import Contact from "@/pages/admin/Contact";
import TopupAccounts from "@/pages/admin/TopupAccounts";
import Topups from "@/pages/Topups";
import Withdrawals from "@/pages/Withdrawals";
import Orders from "@/pages/Orders";
import Products from "@/pages/seller/Products";
import Store from "@/pages/seller/Store";
import Chats from "@/pages/Chats";

const HOME = {
  admin: "/users",
  seller: "/seller/products",
  courier: "/orders",
  buyer: "/orders",
};
const ROUTES = [
  ["/users", Users, ["admin"]],
  ["/categories", Categories, ["admin"]],
  ["/settings", AdminSettings, ["admin"]],
  ["/contact", Contact, ["admin"]],
  ["/accounts", TopupAccounts, ["admin"]],
  ["/topups", Topups, ["admin", "buyer"]],
  ["/withdrawals", Withdrawals, ["admin", "seller", "courier"]],
  ["/orders", Orders, ["admin", "seller", "courier", "buyer"]],
  ["/chats", Chats, ["admin", "seller", "buyer"]],
  ["/seller/products", Products, ["seller"]],
  ["/store", Store, ["seller"]],
];

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<ProductCatalog />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route
        path="/login"
        element={<Navigate to={HOME[user.role]} replace />}
      />
      <Route
        path="/register"
        element={<Navigate to={HOME[user.role]} replace />}
      />
      <Route path="/shop" element={<Navigate to="/products" replace />} />
      <Route element={<Layout />}>
        {ROUTES.filter(([, , roles]) => roles.includes(user.role)).map(
          ([path, El]) => (
            <Route key={path} path={path} element={<El />} />
          ),
        )}
        <Route path="*" element={<Navigate to={HOME[user.role]} replace />} />
      </Route>
    </Routes>
  );
}
