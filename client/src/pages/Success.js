import React from 'react'
import { NavLink } from 'react-router-dom'
const Success = () => {
    return (
        <div>
            <h1>Success page</h1>
            <NavLink to={'/'}>Go to home Page</NavLink>
        </div>
    )
}

export default Success
