import React from 'react'
import { useSelector } from 'react-redux'
import isProfessional from '../utils/roles/isProfessional'

const ProfessionalPermision = ({children}) => {
    const user = useSelector(state => state.user)


  return (
    <>
        {
            isProfessional(user.role) ?  children : <p className='text-red-600 bg-red-100 p-4'>Do not have permission</p>
        }
    </>
  )
}

export default ProfessionalPermision
