import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Collaborators from './pages/Collaborators';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Invoice from './pages/Invoice';
import InvoiceHistory from './pages/InvoiceHistory';
import PurchaseOrder from './pages/PurchaseOrder';
import PurchaseOrderHistory from './pages/PurchaseOrderHistory';
import ConfirmedInvoice from './pages/ConfirmedInvoice';
import ConfirmedInvoiceHistory from './pages/ConfirmedInvoiceHistory';
import Healthix from './pages/Healthix';
import HealthixAppRedirect from './pages/HealthixAppRedirect';
import HealthixSupport from './pages/HealthixSupport';
import HealthixPrivacyPolicy from './pages/HealthixPrivacyPolicy';
import HealthixDeleteAccount from './pages/HealthixDeleteAccount';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <ScrollToTop />
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup7025637872" element={<Signup />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/invoice-history" element={<InvoiceHistory />} />
            <Route path="/purchase-order" element={<PurchaseOrder />} />
            <Route path="/purchase-order-history" element={<PurchaseOrderHistory />} />
            <Route path="/confirmed-invoice" element={<ConfirmedInvoice />} />
            <Route path="/confirmed-invoice-history" element={<ConfirmedInvoiceHistory />} />
            <Route path="/healthix" element={<Healthix />} />
            <Route path="/healthix/download" element={<HealthixAppRedirect />} />
            <Route path="/healthix/support" element={<HealthixSupport />} />
            <Route path="/healthix/privacypolicy" element={<HealthixPrivacyPolicy />} />
            <Route path="/healthix/delete-account" element={<HealthixDeleteAccount />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
