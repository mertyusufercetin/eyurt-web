"use client";
export default function UsersOpen({isOpen, onClose}) {

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-black font-bold"
        >
          X
        </button>
        
        <h2 className="text-black text-2xl mb-4">Giriş Yap</h2>
        {/* Form kodların buraya gelecek */}
        <input type="text" placeholder="Email" className="border p-2 w-full mb-2 text-black" />
        <button className="bg-black text-white w-full py-2 rounded">Giriş</button>
      </div>
    </div>
  )
}