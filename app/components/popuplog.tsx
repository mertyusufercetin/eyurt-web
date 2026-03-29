'use client';
import { useState } from "react";
import Image from 'next/image';
import Logo from "../../public/e_yurtLogo.jpg";
import "../scss/user-log-reg.scss";

interface PageProps{
  closeFunction: () => void;
}

export default function Loginpage({closeFunction}:PageProps) {

  const [id, setID] = useState<string>();
  const [pass, setPass] = useState<string>();

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault(); 
      console.log("TC:", id, "Şifre:", pass);
  };


  return (
    <div className="main-popup flex items-center justify-center h-full">
      <section className="section-student">
        <div className="flex flex-col items-center text-xl">
          <Image src={Logo} alt="Logo" className="w-30 rounded-xl" />
          <span>E_YURT</span>
        </div>
      
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full"> 
          <h3>TC Kimlik Bilginiz: </h3>
          <input onChange={(e)=>{setID(e.target.value)}} maxLength={11} name="tc" autoComplete="on" required type="text" className="inputs" />
          <h3 className="mt-5">Devlet Şifreniz: </h3>
          <input onChange={(e)=>{setPass(e.target.value)}} minLength={8} maxLength={20} name="password" autoComplete="on" required type="password" className="inputs"/>
          <button type="submit" className="mt-10 bg-black border-2 p-2 w-50 rounded-3xl text-white cursor-pointer">GİRİŞ YAP</button>
        </form>

        <button name="cıkıs" onClick={closeFunction} className="bg-white text-black border-2 border-black rounded-2xl p-1 w-40 cursor-pointer"> Çıkış Yap</button>
      </section>
    </div>
  )
}
