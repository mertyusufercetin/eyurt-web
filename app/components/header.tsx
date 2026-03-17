import "../scss/header.scss";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo_beyaz.png";

export default function Header() {
  return (
    <header className="site-header">
      <Image src={logo} alt="Logo" className="logo" />
      <nav className="nav-links">
        <Link href="#">Ana Sayfa</Link>
        <Link href="#">Öğrenci paneli</Link>
        <Link href="#">Giriş yap / Kayıt Ol</Link>
      </nav>
    </header>
  );
}

