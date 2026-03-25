"use client";

import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Materiais Elétricos", slug: "materiais-eletricos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/3e782b08-b7ef-4f9c-9aee-cd908cad64bf___c9e2e468e7b8a5d27ad5116accebea21.png" },
  { name: "Materiais Hidráulicos", slug: "materiais-hidraulicos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/4d5fc596-114a-4bb4-b724-f3fb33510378___f159f61df390137ce122aaec2536f9f4.png" },
  { name: "Materiais para Construção", slug: "materiais-para-construcao", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/2122f7a0-c1f8-4bf3-9572-f36cb5a60c37___41d1e46251c4caad229265cb5c994631.png" },
  { name: "Pisos e Revestimentos", slug: "pisos-e-revestimentos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/c8b54ae7-30e6-49db-af66-82464a4cb0a1___0478607fe2e6d51b7118b8f76195b556.png" },
  { name: "Tintas e Acessórios para Pintura", slug: "tintas-e-acessorios-para-pintura", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/3309f5b0-a839-4363-9d1f-655c496341e5___0ade5fa537b544f916baf1f389efb6b1.png" },
  { name: "Banheiro", slug: "banheiro", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/7a237921-6369-4602-a1e9-3e0c17614491___3088e8cf5769d678ee2f1342addc5e7a.png" },
  { name: "Casa e Jardim", slug: "casa-e-jardim", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/d6cc2c61-5542-4f22-9975-459f75a3ed0b___251e5edaf79e60b72dd794f7edb9b896.png" },
  { name: "Climatização e Ventilação", slug: "climatizacao-e-ventilacao", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/e29669dd-bd09-488e-b0df-c10cea3c5364___74d4832ddec5b847b1412129fb886c4d.png" },
  { name: "Cozinha e Lavanderia", slug: "cozinha-e-lavanderia", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/30ef827e-50bd-4095-b009-aa3c269ad841___984205c78b49e19ec22d1b61480c3267.png" },
  { name: "Eletrodomésticos", slug: "eletrodomesticos", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/316166a0-8bec-4d58-b1f9-34923764fcad___5c5c6b47b0a52dee52a665f4bb30bb56.png" },
  { name: "Eletroportáteis", slug: "eletroportateis", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/4fd817a3-ab60-4c0b-bba2-8ddb6505411c___714ff8699a667ec0bc2d2a4cd429a2a7.png" },
  { name: "Ferragens", slug: "ferragens", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/d67a47be-ff75-4741-8b10-36e5bf9ed7e3___b281c13d63f66c133e9ab42c5fe9d59b.png" },
  { name: "Ferramentas", slug: "ferramentas", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/1b339576-a446-4ea6-b863-bbcbe3c57b8a___d897f93b42ab779272105bcb58e0f63a.png" },
  { name: "Iluminação", slug: "iluminacao", image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/bfd5d275-a79e-448e-9180-bfd44c744cf3___2325452b9564bc26200ffc23fb0b3a80.png" },
];

export default function CategoryGrid() {
  const firstRow = categories.slice(0, 7);
  const secondRow = categories.slice(7);

  return (
    <section className="catgrid">
      <div className="catgrid__container">
        <h2 className="catgrid__title">
          As melhores marcas e a maior variedade!
        </h2>

        <div className="catgrid__row catgrid__row--first">
          {firstRow.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="catgrid__link"
            >
              <div className="catgrid__img-wrap">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain"
                  sizes="110px"
                />
              </div>
              <span className="catgrid__label">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="catgrid__row">
          {secondRow.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="catgrid__link"
            >
              <div className="catgrid__img-wrap">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain"
                  sizes="110px"
                />
              </div>
              <span className="catgrid__label">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
