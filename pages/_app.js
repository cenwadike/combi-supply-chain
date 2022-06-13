import Home from '.'
import '../styles/globals.css'
import Footer from '../components/Footer'
import About from '../pages/about'


function MyApp({ Component, pageProps }) {

  return (
    <>
      <Home />
      <Component {...pageProps} />
      <About />
      <Footer />
    </>
  )
}

export default MyApp
