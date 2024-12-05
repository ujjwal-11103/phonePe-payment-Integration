import React from 'react'
import { NavLink } from 'react-router-dom'

const Home = () => {
    return (
        <div>
            <h1>PhonePe Integration</h1>
            <NavLink to={'/payment'}>Go to Payment details</NavLink>
        </div>
    )
}

export default Home
