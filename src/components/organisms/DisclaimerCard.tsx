import React from "react";
import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";

export function DisclaimerCard() {
  return (
    <Card as="section">
      <SectionHeader title="Disclaimer" />
      <div className="space-y-4 px-6 pb-6 pt-4 text-slate-600">
        <p>
          Konten pada platform Newsmaker.id dan sistem NM Ai (Newsmaker
          Intelligence) bersifat informatif dan edukatif, tidak dimaksudkan
          sebagai saran resmi atau panduan dalam pengambilan keputusan keuangan,
          investasi, atau perdagangan.
        </p>
        <p>
          Semua informasi, analisa, dan opini yang disajikan oleh NM Ai
          didasarkan pada data publik, rilis resmi, dan sumber kredibel.
          Keputusan investasi sepenuhnya merupakan tanggung jawab pengguna.
          Newsmaker.id tidak bertanggung jawab atas segala bentuk keuntungan
          atau kerugian yang timbul akibat penggunaan informasi yang disediakan.
        </p>
        <p>
          Pengunjung disarankan untuk selalu melakukan riset mandiri atau
          konsultasi dengan ahli keuangan profesional sebelum mengambil
          keputusan apa pun yang bersifat finansial.
        </p>
        <p className="font-semibold text-slate-700">
          Kami bukan broker, bukan pialang, bukan marketing, dan tidak melakukan
          transaksi keuangan atau perdagangan (trading) dalam bentuk apa pun.
        </p>
      </div>
    </Card>
  );
}
