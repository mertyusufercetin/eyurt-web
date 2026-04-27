// Supabase types - Gerçek database şemasına göre oluşturulmuştur
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
  oda_no: string | null;
  kat: number;
  kapasite: number;
  dolu_kisi_sayisi: number;
  durum: string | null;
  created_at: string;
}

export interface OdaDegisimTalebi {
  id: string;
  kullanici_id: string;
  mevcut_oda_id: string;
  istenen_oda_id: string;
  sebep: string;
  durum: string;
  degerlendiren_id: string | null;
  created_at: string;
}

export interface Izin {
  id: string;
  kullanici_id: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  sebep: string | null;
  durum: string | null;
  onaylayan_id: string | null;
  created_at: string;
}

export interface Duyuru {
  id: string;
  baslik: string | null;
  icerik: string | null;
  yayinlayan_id: string;
  hedef_kitle: string | null;
  onemli: boolean;
  created_at: string;
}

export interface YemekMenusu {
  id: string;
  tarih: string;
  ogun: string;
  menu_detay: string;
  created_at: string;
}

export interface GirisCikisLog {
  id: string;
  kullanici_id: string;
  tip: string;
  tarih_saat: string;
  aciklama: string | null;
}

export interface Ceza {
  id: string;
  kullanici_id: string;
  ceza_turu: string | null;
  aciklama: string | null;
  tarih: string;
  memur_id: string;
  created_at: string;
}

export interface Basvuru {
  id: string;
  ad: string | null;
  soyad: string | null;
  tc_kimlik: string | null;
  email: string | null;
  telefon: string | null;
  dogum_tarihi: string | null;
  okul: string | null;
  bolum: string | null;
  ogrenci_no: string | null;
  sinif: number | null;
  basvuru_tarihi: string | null;
  donem: string | null;
  oda_tercihi: string | null;
  gelir_durumu: string | null;
  durum: string | null;
  degerlendiren_id: string | null;
  kullanici_id: string | null;
  atanan_oda_id: string | null;
  created_at: string;
  guncellendi_at: string | null;
}

export interface SporSahasi {
  id: string;
  alan_adi: string | null;
  kapasite: number | null;
  durum: string | null;
  created_at: string;
}

export interface SporRezervasyon {
  id: string;
  saha_id: string;
  kullanici_id: string;
  tarih: string;
  baslangic_saati: string;
  bitis_saati: string;
  created_at: string;
}

export interface Form {
  id: string;
  gonderen_id: string;
  alici_id: string;
  konu: string;
  icerik: string;
  durum: string;
  created_at: string;
}

export interface KayipBuluntu {
  id: string;
  bildiren_id: string;
  tur: string;
  esya_adi: string;
  aciklama: string | null;
  bulundugu_yer: string | null;
  fotograf_url: string | null;
  durum: string;
  teslim_alan_id: string | null;
  teslim_tarihi: string | null;
  created_at: string;
}

export interface Odeme {
  id: string;
  kullanici_id: string;
  tutar: number;
  ay: number;
  yil: number;
  durum: string;
  aciklama: string | null;
  odeme_tarihi: string | null;
  created_at: string;
}

export interface Camasirhane {
  id: string;
  makine_no: string;
  tur: string;
  kat: number | null;
  durum: string;
  kalan_sure: number | null;
  created_at: string;
}

export interface CamasirhaneleriArizasi {
  id: string;
  makine_id: string;
  bildiren_id: string;
  aciklama: string;
  durum: string;
  created_at: string;
  cozuldu_at: string | null;
}

export interface OdaAtamasi {
  id: string;
  kullanici_id: string;
  oda_id: string;
  baslangic_tarihi: string;
  bitis_tarihi: string | null;
  aktif: boolean;
  created_at: string;
}

export interface OdaArizasi {
  id: string;
  bildiren_id: string | null;
  oda_id: string | null;
  baslik: string | null;
  aciklama: string | null;
  durum: string | null;
  created_at: string;
  cozuldu_at: string | null;
}
}
