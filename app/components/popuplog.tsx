'use client';
import { useState } from "react";
import Image from 'next/image';
import Logo from "../../public/e_yurtLogo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
     
     <div className="second-popup w-max h-max bg-white p-10 border-2 border-red-600 rounded-xl">
        <form className="flex flex-col gap-5" action="" onSubmit={handleSubmit}>
          
          
          <div>
            <input
            placeholder="TC Kimlik" 
            maxLength={11}
            required
            className="type-input" 
            type="text" />
            <FontAwesomeIcon icon="fa-solid fa-circle-user" />          </div>
          
          <div>
            <input
            placeholder="E-Şifre" 
            maxLength={20}
            required
            className="type-input" 
            type="password" />
          </div>

          
          <button 
          className="type-input" 
          type="submit">
            Giriş Yap
          </button>
        </form>
     </div>

     

    </div>
  )
}
