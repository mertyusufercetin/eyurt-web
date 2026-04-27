-- =====================================================
-- E-YURT Missing Columns Migration
-- Supabase SQL Editor'de çalıştırın
-- =====================================================

-- odalar: oda_no ve durum eksik
ALTER TABLE odalar ADD COLUMN IF NOT EXISTS oda_no text;
ALTER TABLE odalar ADD COLUMN IF NOT EXISTS durum text DEFAULT 'aktif';

-- oda_arizalari: baslik, aciklama, durum, oda_id eksik
ALTER TABLE oda_arizalari ADD COLUMN IF NOT EXISTS baslik text;
ALTER TABLE oda_arizalari ADD COLUMN IF NOT EXISTS aciklama text;
ALTER TABLE oda_arizalari ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';
ALTER TABLE oda_arizalari ADD COLUMN IF NOT EXISTS oda_id uuid REFERENCES odalar(id) ON DELETE SET NULL;

-- izinler: sebep ve durum eksik
ALTER TABLE izinler ADD COLUMN IF NOT EXISTS sebep text;
ALTER TABLE izinler ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';

-- duyurular: baslik, icerik, hedef_kitle eksik
ALTER TABLE duyurular ADD COLUMN IF NOT EXISTS baslik text;
ALTER TABLE duyurular ADD COLUMN IF NOT EXISTS icerik text;
ALTER TABLE duyurular ADD COLUMN IF NOT EXISTS hedef_kitle text DEFAULT 'herkes';

-- cezalar: ceza_turu ve aciklama eksik
ALTER TABLE cezalar ADD COLUMN IF NOT EXISTS ceza_turu text DEFAULT 'tutanak';
ALTER TABLE cezalar ADD COLUMN IF NOT EXISTS aciklama text;

-- basvurular: ad, durum ve diğer alanlar eksik
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS ad text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS okul text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS bolum text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS ogrenci_no text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS donem text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS oda_tercihi text;
ALTER TABLE basvurular ADD COLUMN IF NOT EXISTS gelir_durumu text;

-- yemek_menusu: ogun ve menu_detay eksik
ALTER TABLE yemek_menusu ADD COLUMN IF NOT EXISTS ogun text;
ALTER TABLE yemek_menusu ADD COLUMN IF NOT EXISTS menu_detay text;

-- giris_cikis_loglari: tip ve aciklama eksik
ALTER TABLE giris_cikis_loglari ADD COLUMN IF NOT EXISTS tip text DEFAULT 'giris';
ALTER TABLE giris_cikis_loglari ADD COLUMN IF NOT EXISTS aciklama text;

-- formlar: konu, icerik, durum eksik
ALTER TABLE formlar ADD COLUMN IF NOT EXISTS konu text;
ALTER TABLE formlar ADD COLUMN IF NOT EXISTS icerik text;
ALTER TABLE formlar ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';

-- spor_sahalari: alan_adi eksik
ALTER TABLE spor_sahalari ADD COLUMN IF NOT EXISTS alan_adi text;

-- kayip_buluntu: tur, esya_adi, aciklama, bulundugu_yer, fotograf_url, durum eksik
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS tur text;
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS esya_adi text;
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS aciklama text;
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS bulundugu_yer text;
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS fotograf_url text;
ALTER TABLE kayip_buluntu ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';

-- camasirhane_arizalari: aciklama, durum eksik
ALTER TABLE camasirhane_arizalari ADD COLUMN IF NOT EXISTS aciklama text;
ALTER TABLE camasirhane_arizalari ADD COLUMN IF NOT EXISTS durum text DEFAULT 'beklemede';

-- =====================================================
-- kullanicilar tablosundaki eksik metin sütunları
-- (Eğer bunlar zaten varsa hata vermez - IF NOT EXISTS)
-- =====================================================
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS ad text;
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS soyad text;
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS telefon text;
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS rol text DEFAULT 'ogrenci';
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS ogrenci_no text;
ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS tc_kimlik text;
