import Image from "next/image";

const sections = [
  {
    title: "Tudo o que você precisa do início ao fim da sua obra",
    text: "Temos opções em produtos que vão desde o alicerce até ao acabamento, e tudo com o melhor preço e condições de pagamento facilitadas.",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/d6b35fbb-2c98-4a64-aa99-2699ab631926___93f9948eb04c219dde115bdf07e0a20c.jpg",
  },
  {
    title: "Pisos e revestimentos: revestindo mais que ambiente, revestindo sonhos",
    text: "Oferecemos uma linha extensa de tamanhos e modelos, seja para áreas internas ou externas, tudo com garantia de qualidade.",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/eef52fd0-b0f1-4ae8-a815-ae894034cfcc___e3309b3b3152b55cf9c6c195c63534d3.png",
  },
  {
    title: "Eletrodomésticos: funcionais e elegantes",
    text: "Linha completa de eletrodomésticos das melhores marcas como Consul, Brastemp, Midea e Panasonic.",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/aafe06f6-4324-4aee-bfdc-eb60162016c2___421c3fc68d964ad3b93ea0239d6a829d.png",
  },
  {
    title: "O ambiente na temperatura ideal",
    text: "Grande variedade de ares condicionados e ventiladores certificados pelo INMETRO com alta qualidade e tecnologia.",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/18cbbd6c-8661-4c8e-aca9-8cecf779ed05___3fe66fe28c43704c5582ae45e051ec8a.png",
  },
];

export default function InstitutionalSection() {
  return (
    <section className="inst">
      <div className="inst__container">
        <h2 className="inst__title">
          Casas da Água: Há mais de 57 anos a sua loja
        </h2>
        <p className="inst__subtitle">
          Oferece produtos para todas as fases da construção e da reforma, bem como uma variada linha de acabamentos,
          pisos e revestimentos, materiais hidráulicos e elétricos, tintas, eletrodomésticos e muito mais.
        </p>

        <div className="inst__cards">
          {sections.map((item, i) => (
            <div key={i} className="inst__card">
              <div className="inst__card-img">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
              <div className="inst__card-body">
                <h3 className="inst__card-title">{item.title}</h3>
                <p className="inst__card-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="inst__info-grid">
          {[
            {
              title: "Marcas com garantia de qualidade",
              text: "Suvinil, Vedacit, Tigre, Roca, Firenze, Votorantim, Ceramfix, Bosch, Eliane, Gerdau e muito mais.",
            },
            {
              title: "Obra protegida",
              text: "Linha de impermeabilizantes que garantem proteção e segurança contra infiltrações e umidades.",
            },
            {
              title: "Tudo para a pintura perfeita",
              text: "Encontre a cor ideal e acessórios para pintura com condições facilitadas de pagamento.",
            },
            {
              title: "Linha completa de produtos",
              text: "Eletrodomésticos, pias, cubas, rejuntes, argamassas, bacias e lavatórios.",
            },
          ].map((item, i) => (
            <div key={i} className="inst__info-card">
              <p className="inst__info-text">
                <strong>{item.title}: </strong>{item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
