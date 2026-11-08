import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import InstructorDashboard from "./components/InstructorDashboard/InstructorDashboard";

import StudentLayout from "./components/Student/StudentLayout";
import StudentOnboarding from "./components/StudentOnboarding/StudentOnboarding";
import StudentDashboard from "./components/Student/StudentDashboard";
import MyCourses from "./components/Student/MyCourses";
import GradeReport from "./components/Student/GradeReport";
import Assessments from "./components/Student/Assessments";
import CompetencyTracker from "./components/Student/CompetencyTracker";
import Communication from "./components/Student/Communication";
import VideoMeetings from "./components/Student/VideoMeetings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/instructor" element={<InstructorDashboard />} />

        {/* Student layout + nested pages */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<MyCourses />} />
          <Route path="grades" element={<GradeReport />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="competency" element={<CompetencyTracker />} />
          <Route path="communication" element={<Communication />} />
          <Route path="meetings" element={<VideoMeetings />} />
        </Route>

        <Route
          path="/forgot-password"
          element={<div>Forgot Password Page</div>}
        />

        <Route path="/unauthorized" element={<div>Access Denied</div>} />
        <Route path="/student/onboarding" element={<StudentOnboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
