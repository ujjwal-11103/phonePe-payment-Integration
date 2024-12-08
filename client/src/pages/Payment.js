import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Payment = () => {
    const navigate = useNavigate()

    const data = {
        name: 'Ujjwal Upadhyay',
        amount: 2,
        number: '7887575591',
        MUID: "MUID" + Date.now(),
        transactionId: 'T' + Date.now(),
    }

    const handlePayment = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post('http://localhost:8000/order', { ...data })
            console.log(res)
            if (res.data && res.data.data.instrumentResponse.redirectInfo.url) {
                window.location.href = res.data.data.instrumentResponse.redirectInfo.url;
                navigate('/success');  // This will redirect the user to the "/success" page
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form onSubmit={handlePayment}>
            <div className='col-12 '>
                <p className='fs-5'><strong>Name:</strong> {data.name}</p>
            </div>
            <div className='col-12 '>
                <p className='fs-5'><strong>Number:</strong> {data.number}</p>
            </div>
            <div className='col-12 '>
                <p className='fs-5'><strong>Amount:</strong> {data.amount} Rs</p>
            </div>
            <div className='col-12 center'>
                <button className='w-100 ' type="submit">Pay Now</button>
            </div>
        </form>
    )
}

export default Payment
