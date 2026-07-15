import { useState } from 'react'
import Topbar from './components/Topbar.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Stats from './components/Stats.jsx'
import Services from './components/Services.jsx'
import WhyRcs from './components/WhyRcs.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import EnquiryModal from './components/EnquiryModal.jsx'

export default function App() {
  const [enquiryOpen, setEnquiryOpen] = useState(() => window.location.hash === '#enquiry')
  const openEnquiry = () => setEnquiryOpen(true)
  const closeEnquiry = () => setEnquiryOpen(false)

  return (
    <>
      <Topbar />
      <Navbar onEnquiry={openEnquiry} />
      <main>
        <Hero onEnquiry={openEnquiry} />
        <Stats />
        <Services />
        <WhyRcs onEnquiry={openEnquiry} />
      </main>
      <Footer />
      <WhatsAppFloat />
      <EnquiryModal open={enquiryOpen} onClose={closeEnquiry} />
    </>
  )
}
