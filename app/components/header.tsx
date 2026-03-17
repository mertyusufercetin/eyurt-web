"use client"

import Link from "next/link";
import "../scss/header.scss";
import Image from "next/image";
import logo from "../../public/logo_beyaz.png";
import { useState } from "react";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="site-header">
      <Image src={logo} alt="Logo" className="logo" />
      <nav className="nav-links" >
        <Link href="/">Ana Sayfa</Link>
        <Link href="#" className="">Öğrenci paneli</Link>
        <Link href="#" className="">Çalışan paneli</Link>
        <button onClick={() =>{console.log(setIsModalOpen(true))}} className="rounded-xl bg-black p-3 px-5 cursor-pointer hover:bg-gray-700 transition-all">Giriş Yap / Kayıt Ol</button>
      </nav>
    </header>
  );
}

