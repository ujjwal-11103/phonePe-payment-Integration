import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Failure from './pages/Failure';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define different routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />
      </Routes>
    </Router>
  );
}

export default App;
