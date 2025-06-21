import { useEffect, useState } from 'react'
import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

function AdviserProfile({ crdNumber = '284561' }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      // Fetch from state_adv_part_1_data by CRD number (or use doc ID if that's how you store it)
      const docRef = doc(db, 'state_adv_part_1_data', crdNumber)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProfile(docSnap.data())
      } else {
        setProfile(null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [crdNumber])

  if (loading) return <div>Loading...</div>
  if (!profile) return <div>Adviser not found.</div>

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{profile.primary_business_name}</h1>
      <div className="mb-2">
        <strong>CRD Number:</strong> {profile.crd_number}
      </div>
      <div className="mb-2">
        <strong>Status Effective Date:</strong> {profile.status_effective_date}
      </div>
      <div className="mb-2">
        <strong>Employees Performing Investment:</strong> {profile['5b1_how_many_employees_perform_investmen']}
      </div>
      <div className="mb-2">
        <strong>Assets Under Management (Total):</strong> {profile['5f2_assets_under_management_total_number']}
      </div>
      <div className="mb-2">
        <strong>Assets Under Management (USD):</strong> {profile['5f2_assets_under_management_total_us_dol']}
      </div>
      <div className="mb-2">
        <strong>Address:</strong> {profile.principal_office_address_1}, {profile.principal_office_city}, {profile.principal_office_state} {profile.principal_office_postal_code}
      </div>
      <div className="mb-2">
        <strong>Phone:</strong> {profile.principal_office_telephone_number}
      </div>
      <div className="mb-2">
        <strong>Website:</strong> <a href={profile.website_address} className="text-blue-600 underline">{profile.website_address}</a>
      </div>
      {/* Add more fields as needed */}
    </div>
  )
}

export default AdviserProfile