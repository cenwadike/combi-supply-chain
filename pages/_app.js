import '../styles/globals.css'
import Footer from '../components/Footer'
import Head from '../components/Header'
import Navbar from '../components/NavBar'


function MyApp({ Component, pageProps }) {

  return (
    <>
      <Head />
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

export default MyApp
