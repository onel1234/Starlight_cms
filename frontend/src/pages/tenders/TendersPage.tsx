import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { TenderManagement } from '../../components/tenders/TenderManagement'
import { PublicTenderPortal } from '../../components/tenders/PublicTenderPortal'
import { TenderSubmissions } from '../../components/tenders/TenderSubmissions'
import { TenderArchive } from '../../components/tenders/TenderArchive'
import { useAuth } from '../../hooks/useAuth'

export const TendersPage: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="p-6">
      <Routes>
        <Route index element={<TenderManagement />} />
        <Route path="available" element={<PublicTenderPortal />} />
        <Route path="submissions" element={<TenderSubmissions />} />
        <Route path="archive" element={<TenderArchive />} />
      </Routes>
    </div>
  )
}