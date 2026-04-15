export interface Kullanici {
  id: string;
  ad: string;
  soyad: string;
  email: string;
  telefon: string | null;
  rol: 'ogrenci' | 'memur' | 'mudur';
  ogrenci_no: string | null;
  tc_kimlik: string;
  aktif: boolean;
  created_at: string;
}

export interface Oda {
  id: string;
  oda_no: string;
  kat: number;
  kapasite: number;
  dolu_kisi_sayisi: number;
  durum: 'aktif' | 'pasif' | 'tadilatta';
  created_at: string;
}

export interface Basvuru {
  id: string;
  ad: string;
  soyad: string;
  tc_kimlik: string;
  email: string;
  telefon: string;
  dogum_tarihi: string;
  okul: string;
  bolum: string;
  ogrenci_no: string;
  sinif: number;
  basvuru_tarihi: string;
  donem: string;
  oda_tercihi: '2_kisilik' | '4_kisilik' | 'farketmez';
  gelir_durumu: 'dusuk' | 'orta' | 'yuksek';
  durum: 'beklemede' | 'onaylandi' | 'reddedildi' | 'iptal';
  degerlendiren_id: string | null;
  red_sebebi: string | null;
  kullanici_id: string | null;
  atanan_oda_id: string | null;
  created_at: string;
  guncellendi_at: string;
}

export interface Odeme {
  id: string;
  kullanici_id: string | null;
  tutar: number;
  ay: number;
  yil: number;
  durum: 'odendi' | 'odenmedi' | 'gecikti';
  odeme_tarihi: string | null;
  aciklama: string | null;
  created_at: string;
}

export interface Izin {
  id: string;
  kullanici_id: string | null;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  sebep: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  onaylayan_id: string | null;
  created_at: string;
}

export interface OdaArizasi {
  id: string;
  oda_id: string | null;
  bildiren_id: string | null;
  baslik: string;
  aciklama: string;
  durum: 'beklemede' | 'isleme_alindi' | 'cozuldu';
  created_at: string;
  cozuldu_at: string | null;
}

export interface Camasirhane {
  id: string;
  makine_no: string;
  tur: 'camasir' | 'kurutucu';
  kat: number | null;
  durum: 'bos' | 'dolu' | 'arizali';
  created_at: string;
  kalan_sure: number | null;
}

export interface YemekMenusu {
  id: string;
  tarih: string;
  ogun: 'sabah' | 'ogle' | 'aksam';
  menu_detay: string;
  created_at: string;
}

export interface Duyuru {
  id: string;
  baslik: string;
  icerik: string;
  yayinlayan_id: string | null;
  hedef_kitle: 'herkes' | 'ogrenci' | 'memur';
  onemli: boolean;
  created_at: string;
}

export interface Ceza {
  id: string;
  kullanici_id: string | null;
  ceza_turu: 'tutanak' | 'sigara' | 'diger';
  aciklama: string;
  tarih: string;
  memur_id: string | null;
  created_at: string;
}

export interface OdaAtamasi {
  id: string;
  kullanici_id: string | null;
  oda_id: string | null;
  baslangic_tarihi: string;
  bitis_tarihi: string | null;
  aktif: boolean;
  created_at: string;
}

export interface GirisCikisLog {
  id: string;
  kullanici_id: string | null;
  tip: 'giris' | 'cikis';
  tarih_saat: string;
  aciklama: string | null;
}

export interface KayipBuluntu {
  id: string;
  bildiren_id: string | null;
  tur: 'kayip' | 'buluntu';
  esya_adi: string;
  aciklama: string | null;
  bulundugu_yer: string | null;
  fotograf_url: string | null;
  durum: 'aktif' | 'cozuldu';
  teslim_alan_id: string | null;
  teslim_tarihi: string | null;
  created_at: string;
}

export interface Form {
  id: string;
  gonderen_id: string | null;
  alici_id: string | null;
  konu: string;
  icerik: string;
  durum: 'okundu' | 'okunmadi';
  created_at: string;
}

export interface SporSahasi {
  id: string;
  alan_adi: string;
  kapasite: number | null;
  durum: 'bos' | 'dolu' | 'kapali';
  created_at: string;
}

export interface SporRezervasyon {
  id: string;
  saha_id: string | null;
  kullanici_id: string | null;
  tarih: string;
  baslangic_saati: string;
  bitis_saati: string;
  created_at: string;
}

export interface CamasirhaneArizasi {
  id: string;
  makine_id: string | null;
  bildiren_id: string | null;
  aciklama: string;
  durum: 'beklemede' | 'isleme_alindi' | 'cozuldu';
  created_at: string;
  cozuldu_at: string | null;
}

export interface OdaDegisimTalebi {
  id: string;
  kullanici_id: string | null;
  mevcut_oda_id: string | null;
  istenen_oda_id: string | null;
  sebep: string;
  durum: 'beklemede' | 'onaylandi' | 'reddedildi';
  degerlendiren_id: string | null;
  created_at: string;
}
