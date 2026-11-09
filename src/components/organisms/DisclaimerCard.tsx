import { Card } from "../atoms/Card";
import { SectionHeader } from "../molecules/SectionHeader";

export function DisclaimerCard() {
  return (
    <Card>
      <SectionHeader title="Disclaimer" />
      <div className="p-4 space-y-7">
        <p>
          Konten pada platform <strong>Newsmaker.id</strong> dan sistem{" "}
          <strong>NM Ai</strong> (Newsmaker Intelligence) bersifat informatif
          dan edukatif, tidak dimaksudkan sebagai saran resmi atau panduan dalam
          pengambilan keputusan keuangan, investasi, atau perdagangan.
        </p>
        <p>
          Semua informasi, analisa, dan opini yang disajikan oleh{" "}
          <strong>NM Ai</strong> didasarkan pada data publik, rilis resmi, dan
          sumber kredibel. Keputusan investasi sepenuhnya merupakan tanggung
          jawab pengguna. <strong>Newsmaker.id</strong> tidak bertanggung jawab
          atas segala bentuk keuntungan atau kerugian yang timbul akibat
          penggunaan informasi yang disediakan.
        </p>
        <p>
          Pengunjung disarankan untuk selalu melakukan riset mandiri atau
          konsultasi dengan ahli keuangan profesional sebelum mengambil
          keputusan apa pun yang bersifat finansial.{" "}
          <strong>
            Kami bukan broker, bukan pialang, bukan marketing, dan tidak
            melakukan transaksi keuangan atau perdagangan (trading) dalam bentuk
            apa pun.
          </strong>
        </p>
      </div>
    </Card>
  );
}
