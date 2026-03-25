"use client"
import "../scss/header.scss";
import Link from 'next/link';
import Image from 'next/image';
import LOGO from '../../public/logo_beyaz.png'


export default function Header() {
return(
  <header className="flex items-center text-white text-[1.2vw] font-bold w-full h-30 bg-red-600">

    <Image src={LOGO} alt="Logo" width={150} height={150} className="ml-10" />

    <nav className="flex items-center gap-10 w-max h-20 ml-auto mr-10">

    <Link href="">Personel</Link>/<Link href="">Öğrenci</Link>
    <Link className="p-3 px-5 bg-black text-shadow-black duration-350 ease-in-out" href="/">Ana Sayfa</Link>
    <Link href="">Giriş Yapın</Link>
    </nav>
  </header>
);
}

