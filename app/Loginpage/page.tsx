'use client';
import { useState } from "react";


import "../scss/user-log-reg.scss";

export default function Loginpage() {

const [id, setID] = useState<string>();
const [pass, setPass] = useState<string>();

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("TC:", id, "Şifre:", pass);
};


  return (
    <div className="main-popup flex items-center justify-center h-full">
      <section className="section-student">
        <form onSubmit={handleSubmit} className="flex flex-col"> 
          <h3>TC Kimlik Bilginiz: </h3>
          <input onChange={(e)=>{setID(e.target.value)}} maxLength={11} name="tc" autoComplete="on" required type="text" className="inputs" />
          <h3 className="mt-5">Devlet Şifreniz: </h3>
          <input onChange={(e)=>{setPass(e.target.value)}} minLength={8} maxLength={20} name="password" autoComplete="on" required type="password" className="inputs"/>
          <button type="submit" className="inputs mt-10">GİRİŞ YAP</button>
        </form>
      </section>
    </div>
  )
}
