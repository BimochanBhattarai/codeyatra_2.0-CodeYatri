import React from 'react'
import ManageDriverApplicationsPage from './components/DriverApplicationsPage'
import AuthenticatedWrapper from '@/components/global/AuthenticatedWrapper'

const page = () => {
  return (
    <AuthenticatedWrapper>
        <ManageDriverApplicationsPage />
    </AuthenticatedWrapper>
  )
}

export default page