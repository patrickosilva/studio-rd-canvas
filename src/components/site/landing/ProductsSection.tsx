import { Reveal } from "./Reveal";

const produtos = [
  {
    nome: "Pomada modeladora",
    categoria: "Finalização",
    descricao: "Produto para modelar e manter o cabelo alinhado no dia a dia.",
  },
  {
    nome: "Balm para barba",
    categoria: "Barba",
    descricao: "Ajuda a hidratar, alinhar e reduzir o ressecamento da barba.",
  },
  {
    nome: "Óleo para barba",
    categoria: "Barba",
    descricao: "Finalização premium para brilho, maciez e acabamento.",
  },
  {
    nome: "Kit RD Black",
    categoria: "Combo",
    descricao: "Produtos selecionados para manter o visual em casa.",
  },
];

export function ProductsSection() {
  return (
    <section id="produtos" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Produtos</p>
          <h2 className="font-display-landing mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
            Produtos vendidos no Studio RD
          </h2>
          <p className="mt-5 text-sm text-muted-foreground md:text-base">
            Conheça alguns produtos para manter o visual em casa.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((produto) => (
              <li key={produto.nome} className="border-t border-border pt-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{produto.categoria}</p>
                <h3 className="font-display-landing mt-2 text-lg text-foreground">
                  {produto.nome}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{produto.descricao}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
