
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./Dashboard";
import Analytics from "./Analytics";
import Users from "./Users";
import Solutions from "./Solutions";
import Roles from "./Roles";
import Communications from "./Communications";
import Events from "./Events";
import Learning from "./Learning";
import Benefits from "./Benefits";
import SupabaseDiagnostics from "./SupabaseDiagnostics";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="users" element={<Users />} />
      <Route path="solutions" element={<Solutions />} />
      <Route path="roles" element={<Roles />} />
      <Route path="communications" element={<Communications />} />
      <Route path="events" element={<Events />} />
      <Route path="learning" element={<Learning />} />
      <Route path="benefits" element={<Benefits />} />
      <Route path="diagnostics" element={<SupabaseDiagnostics />} />
    </Routes>
  );
};

export default AdminRoutes;
