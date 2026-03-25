import Link from "next/link";
import Image from "next/image";

const items = [
  { label: "Ferramentas", slug: "ferramentas", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/16bba5e2-78d1-4fd8-9f20-10faa1c0f670___25c7169576e3043c3d9b96b66bcad7d7.png" },
  { label: "Ferragem", slug: "ferragens", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/4ff67bf3-3341-4c97-81ad-84d9587a11ef___3fa2f8922680a5354f82f8b014baa298.png" },
  { label: "Para sua lavanderia", slug: "cozinha-e-lavanderia", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/9ee49b01-6b41-476b-851e-cc6388546096___86ae5583483963c216cf716186ef97a7.png" },
  { label: "Para climatizar", slug: "climatizacao-e-ventilacao", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/fadd6bd3-4717-4ea6-9bf4-d805e674cf1e___20bda06e3caf8a2716e3c0145fd651fc.png" },
  { label: "Para seu jardim", slug: "casa-e-jardim", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/1a7a830e-7574-4b19-b8a8-35b1317eff06___1edaecf008b4d821c0b053a1833bcd38.png" },
  { label: "Para seu banheiro", slug: "banheiro", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/3c8f28f6-8889-487f-975f-4c47d85e6ef4___b89f90fe28ee749f57ef6266cdf8fe41.png" },
  { label: "Materiais de elétrica", slug: "materiais-eletricos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/1f12b87b-d231-409c-b711-f26c80e1f2f4___fa9e1b73ed505d69594862c84606c3b1.png" },
  { label: "Materiais para hidráulica", slug: "materiais-hidraulicos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/9bdfc31e-c148-4cf6-92e3-5fe224232711___d3108310017275122f89d5ed171ba489.png" },
];

export default function WhatYouLookFor() {
  return (
    <section className="wylf">
      <div className="wylf__container">
        <h2 className="wylf__title">O que você procura?</h2>
        <div className="wylf__grid">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/categoria/${item.slug}`}
              className="wylf__card"
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="wylf__card-img"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
