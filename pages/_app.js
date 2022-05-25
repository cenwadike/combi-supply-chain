import Home from '.'
import '../styles/globals.css'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {

  return (
    <>
      <Home />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

export default MyApp
