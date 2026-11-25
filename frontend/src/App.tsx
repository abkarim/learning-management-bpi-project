import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";

// Student
import StudentOnboarding from "./components/StudentOnboarding/StudentOnboarding";
import StudentLayout from "./components/Student/StudentLayout";
import StudentDashboard from "./components/Student/StudentDashboard";
import MyCourses from "./components/Student/MyCourses";
import GradeReport from "./components/Student/GradeReport";
import Assessments from "./components/Student/Assessments";
import CompetencyTracker from "./components/Student/CompetencyTracker";
import Communication from "./components/Student/Communication";
import VideoMeetings from "./components/Student/VideoMeetings";

// Instructor
import InstructorLayout from "./components/Instructor/InstructorLayout";
import InstructorDashboard from "./components/Instructor/InstructorDashboard";
import GradingSystem from "./components/Instructor/GradingSystem";
import CourseManagement from "./components/Instructor/CourseManagement";
import InstructorAssessments from "./components/Instructor/InstructorAssessments";
import InstructorCompetencyTracker from "./components/Instructor/InstructorCompetencyTracker";
import InstructorCommunication from "./components/Instructor/InstructorCommunication";
import InstructorVideoMeetings from "./components/Instructor/InstructorVideoMeetings";
import InstructorMonitoring from "./components/Instructor/InstructorMonitoring";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<AdminDashboard />} />

        {/* Student onboarding (layout chara) */}
        <Route path="/student/onboarding" element={<StudentOnboarding />} />

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

        {/* Instructor layout + nested pages */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          <Route path="grading" element={<GradingSystem />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="assessments" element={<InstructorAssessments />} />
          <Route path="competency" element={<InstructorCompetencyTracker />} />
          <Route path="communication" element={<InstructorCommunication />} />
          <Route path="meetings" element={<InstructorVideoMeetings />} />
          <Route path="monitoring" element={<InstructorMonitoring />} />
        </Route>

        <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
        <Route path="/unauthorized" element={<div>Access Denied</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;