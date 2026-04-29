import Card from '../../components/Card'
import DashboardLayout from './DashboardLayout'

export default function DeptHeadDashboard() {
  return (
    <DashboardLayout title="Department Head Dashboard">
      <div className="stack">
        <div className="pageHeader">
          <h1 className="pageTitle">Department Head</h1>
          <p className="pageSubtitle">
            Department-level controls and reports will appear here as they become available.
          </p>
        </div>

        <Card title="Overview">
          <div className="muted">
            No department head data is available yet. Use the navigation to access currently enabled pages.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
