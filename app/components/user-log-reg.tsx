"use client";

import { useState } from "react";

interface modalProps{
  isOpen: boolean;
  onClose: () => void;
}

interface userslog{
  tc: string;
  e_mail:string;
  sifre:string;
}


export default function UsersOpen({isOpen, onClose}:modalProps) {  
  const [RegLogEvent, setRegLogEvent] = useState(false);
  
  
  if (!isOpen) return null;

  if(RegLogEvent == false) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-black font-bold"
        >
          X
        </button>

        <form action="default"></form>

        <button onClick={()=>{setRegLogEvent(true)}} className="text-black cursor-pointer">Kayıt Ol</button>
      </div>
    </div>
    )
     
     
    if (RegLogEvent == true) return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-black font-bold"
        >
          X
        </button>
        
                <button onClick={()=>{setRegLogEvent(false)}} className="text-black cursor-pointer">Giriş Yap</button>
      </div>
    </div>
    )
}