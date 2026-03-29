"use client"
import "../scss/header.scss";
import Link from 'next/link';
import Image from 'next/image';
import LOGO from '../../public/logo_beyaz.png'

export default function Header() {

return(
  <header>

    <nav>
    <Link className="pagelinks" href="/">Ana Sayfa</Link>
    <Link className="pagelinks" href="#">Geliştiriciler</Link>
    <Link className="pagelinks" href="../Loginpage">Giriş Yap</Link>
    </nav>
  </header>
);

}

