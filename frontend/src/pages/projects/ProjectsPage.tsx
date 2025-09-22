import { Routes, Route } from 'react-router-dom'
import { ProjectDashboard } from '../../components/projects/ProjectDashboard'

export function ProjectsPage() {
  return (
    <Routes>
      <Route index element={<ProjectDashboard />} />
      {/* Future routes for project details, etc. */}
    </Routes>
  )
}