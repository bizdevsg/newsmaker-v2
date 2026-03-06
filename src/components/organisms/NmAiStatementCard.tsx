import React from "react";
import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";

export function NmAiStatementCard() {
  return (
    <Card as="section">
      <SectionHeader title="Pernyataan Tambahan NM Ai" />
      <div className="space-y-4 px-6 pb-6 pt-4 text-slate-600">
        <p>
          NM Ai (Newsmaker Intelligence) merupakan sistem editorial digital
          milik Newsmaker.id yang dirancang untuk memberikan analisa pasar,
          edukasi finansial, dan wawasan perilaku trader secara netral dan
          bertanggung jawab.
        </p>
        <p className="font-semibold text-slate-700">NM Ai berkomitmen untuk:</p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600">
          <li>Menyajikan informasi cepat, akurat, dan bersahabat.</li>
          <li>Menjaga integritas dan netralitas redaksi.</li>
          <li>
            Tidak pernah memberikan sinyal beli/jual atau rekomendasi transaksi.
          </li>
          <li>
            Semua keluaran NM Ai bersifat edukatif, dan disusun dengan standar
            jurnalistik Newsmaker.id.
          </li>
        </ul>
        <p className="text-center font-semibold italic text-slate-500">
          “Edukasi finansial untuk semua. Cepat, akurat, dan bersahabat.”
        </p>
      </div>
    </Card>
  );
}
