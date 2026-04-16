import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";

export function NmAi() {
  return (
    <Card>
      <SectionHeader title="Pernyataan Tambahan NM Ai" />
      <div className="p-4 space-y-7">
        <p>
          <strong>NM Ai</strong> (Newsmaker Intelligence) merupakan sistem
          editorial digital milik Newsmaker.id yang dirancang untuk memberikan
          analisa pasar, edukasi finansial, dan wawasan perilaku trader secara
          netral dan bertanggung jawab.
        </p>
        <div className="space-y-2">
          <p>
            <strong>NM Ai berkomitmen untuk :</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Menyajikan informasi cepat, akurat, dan bersahabat.</li>
            <li>Menjaga integritas dan netralitas redaksi.</li>
            <li>
              Tidak pernah memberikan sinyal beli/jual atau rekomendasi
              transaksi.
            </li>
            <li>
              Semua keluaran NM Ai bersifat edukatif, dan disusun dengan standar
              jurnalistik Newsmaker.id.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
