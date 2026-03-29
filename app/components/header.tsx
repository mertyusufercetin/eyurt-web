"use client"
import "../scss/header.scss";
import { useState } from "react";

import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../public/e_yurtLogo.jpg';
import LoginPage from './popuplog';



export default function Header() {

  const [open, setOpen] = useState<boolean>(false)

return(
  <header>
    <div className="">
      <Image src={Logo} alt="logo" className="w-30 ml-7 rounded-xl" />
    </div>

    <nav>
    <Link className="pagelinks" href="/">Ana Sayfa</Link>
    <Link className="pagelinks" href="#">Geliştiriciler</Link>
    <button className="pagelinks cursor-pointer" onClick={()=>{setOpen(true)}}>Giriş Yap</button>
    {open && <LoginPage closeFunction={() => setOpen(false)} />}
    </nav>
  </header>
);

}

