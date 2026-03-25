export const SITE_NAME = "Casas da Água";
export const SITE_URL = "https://www.casasdaagua.com.br";
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || "";
export const PHONE = process.env.NEXT_PUBLIC_PHONE || "";
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL || "";
export const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS || "";
export const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || "";

export const CATEGORIES = [
  { name: "Banheiro", slug: "banheiro", image: "/images/cat-banheiro.webp", productCount: 1297 },
  { name: "Casa e Jardim", slug: "casa-e-jardim", image: "/images/cat-casa-jardim.webp", productCount: 890 },
  { name: "Climatização e Ventilação", slug: "climatizacao-e-ventilacao", image: "/images/cat-climatizacao.webp", productCount: 320 },
  { name: "Cozinha e Lavanderia", slug: "cozinha-e-lavanderia", image: "/images/cat-cozinha.webp", productCount: 756 },
  { name: "Eletrodomésticos", slug: "eletrodomesticos", image: "/images/cat-eletrodomesticos.webp", productCount: 412 },
  { name: "Eletroportáteis", slug: "eletroportateis", image: "/images/cat-eletroportateis.webp", productCount: 285 },
  { name: "Ferragens", slug: "ferragens", image: "/images/cat-ferragens.webp", productCount: 1100 },
  { name: "Ferramentas", slug: "ferramentas", image: "/images/cat-ferramentas.webp", productCount: 950 },
  { name: "Iluminação", slug: "iluminacao", image: "/images/cat-iluminacao.webp", productCount: 680 },
];

export const TOP_BAR_MESSAGES = [
  "Serviço próprio de entrega! Consulte frete grátis para sua região",
  "Compre no site e receba em casa!",
  "Atendimento e suporte personalizado",
];

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "best-sellers", label: "Mais vendidos" },
  { value: "newest", label: "Mais recentes" },
  { value: "discount", label: "Desconto" },
  { value: "price-asc", label: "Preço: Menor para Maior" },
  { value: "price-desc", label: "Preço: Maior para Menor" },
  { value: "name-asc", label: "Nome: A-Z" },
  { value: "name-desc", label: "Nome: Z-A" },
];
