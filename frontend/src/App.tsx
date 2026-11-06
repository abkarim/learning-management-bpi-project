import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import InstructorDashboard from "./components/InstructorDashboard/InstructorDashboard";
import StudentDashboard from "./components/StudentDashboard/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route
          path="/instructor"
          element={<InstructorDashboard />}
        />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/forgot-password"
          element={<div>Forgot Password Page</div>}
        />

        <Route
          path="/unauthorized"
          element={<div>Access Denied</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;