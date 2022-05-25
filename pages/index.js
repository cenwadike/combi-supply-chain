import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Footer from '../components/Footer'
import Head from '../components/Header'
import Navbar from '../components/NavBar'

export default function Home() {
  return (
    <div className="width: 100%">
      <Head />
      <Navbar />

      <main className={styles.main}>
        <h1> WE ARE HERE </h1>
      </main>

      <Footer />
    </div>
  )
}
