import { useState } from 'react'
import Topbar from './components/Topbar.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import TrustedBy from './components/TrustedBy.jsx'
import Stats from './components/Stats.jsx'
import Services from './components/Services.jsx'
import WhyRcs from './components/WhyRcs.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import EnquiryModal from './components/EnquiryModal.jsx'

export default function App() {
  const [enquiryOpen, setEnquiryOpen] = useState(() => window.location.hash === '#enquiry')
  const [enquiryService, setEnquiryService] = useState('')
  const openEnquiry = (service) => {
    setEnquiryService(typeof service === 'string' ? service : '')
    setEnquiryOpen(true)
  }
  const closeEnquiry = () => setEnquiryOpen(false)

  return (
    <>
      <div className="sticky top-0 z-50">
        <Topbar />
        <Navbar onEnquiry={openEnquiry} />
      </div>
      <main>
        <Hero onEnquiry={openEnquiry} />
        <TrustedBy />
        <Stats />
        <Services onEnquiry={openEnquiry} />
        <WhyRcs onEnquiry={openEnquiry} />
      </main>
      <Footer />
      <WhatsAppFloat />
      <EnquiryModal open={enquiryOpen} onClose={closeEnquiry} initialService={enquiryService} />
    </>
  )
}
