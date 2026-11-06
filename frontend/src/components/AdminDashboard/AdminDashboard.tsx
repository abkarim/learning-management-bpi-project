export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-lg border p-5">
          Manage Users
        </div>

        <div className="rounded-lg border p-5">
          Manage Courses
        </div>

        <div className="rounded-lg border p-5">
          System Settings
        </div>
      </div>
    </div>
  );
}