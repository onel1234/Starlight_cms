import { MainDashboard } from '../../components/reports/MainDashboard';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-secondary-600">
          View comprehensive business reports, analytics, and key performance indicators.
        </p>
      </div>

      <MainDashboard />
    </div>
  )
}