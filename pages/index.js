import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Head from '../components/Header'
import Navbar from '../components/NavBar'

export default function Home() {
  return (
    <div className="width: 100%">
      <Head />
      <Navbar />
    </div>
  )
}
