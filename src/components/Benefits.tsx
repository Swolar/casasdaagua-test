const benefits = [
  {
    icon: "https://cdagua.vtexassets.com/assets/vtex/assets-builder/cdagua.store-theme/8.1.7/icons/icon-deals-house___3839d4e66658061d6731b0345a7a2658.svg",
    text: "Tudo para sua casa em um só lugar",
  },
  {
    icon: "https://cdagua.vtexassets.com/assets/vtex/assets-builder/cdagua.store-theme/8.1.7/icons/icon-deals-store___2d155552a7bfa981773212f66056765f.svg",
    text: "Compre no site e receba em casa!",
  },
  {
    icon: "https://cdagua.vtexassets.com/assets/vtex/assets-builder/cdagua.store-theme/8.1.7/icons/icon-deals-calculator___52c1f14d8eb38e91815bd38f167be3c7.svg",
    text: "Conte com calculadora de BTU's",
  },
  {
    icon: "https://cdagua.vtexassets.com/assets/vtex/assets-builder/cdagua.store-theme/8.1.7/icons/icon-deals-phone___d3032fb836026257ea9a033d360306b4.svg",
    text: "Atendimento e suporte personalizado",
  },
];

export default function Benefits() {
  return (
    <div className="benefits">
      <div className="benefits__container">
        <div className="benefits__list">
          {benefits.map((b, i) => (
            <div key={i} className="benefits__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.icon} alt="" className="benefits__icon" />
              <span className="benefits__text">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
