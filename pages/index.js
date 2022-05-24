import Image from 'next/image'
import styles from '../styles/Home.module.css'
import WalletConnect from './walletConnect'
import Footer from '../components/Footer'
import Head from '../components/Header'
import Navbar from '../components/NavBar'

export default function Home() {
  return (
    <div className="width: 100%">
      <Head />
      <Navbar />

      <main className={styles.main}>
        <WalletConnect />
      </main>

      <Footer />
    </div>
  )
}
