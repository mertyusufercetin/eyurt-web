"use client"
import "../scss/header.scss";
import Link from 'next/link';
import Image from 'next/image';
import LOGO from '../../public/logo_beyaz.png'
import { useState } from "react";

interface control{
  basti: boolean;
  setBasti: (val:boolean) => boolean;
}

export default function Header() {

  const [basti, setBasti] = useState<boolean>(false);

return(
  <header>

    <Image src={LOGO} alt="Logo" width={150} height={150} className="ml-10" />

    <nav>

    <Link className="pagelinks" href="/">Ana Sayfa</Link>
    <button className="pagelinks">Giriş Yap</button>
    </nav>
  </header>
);
}

