import { Scissors } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-md bg-gradient-gold grid place-items-center">
              <Scissors className="w-4 h-4 text-primary-foreground" />
            </span>
            <span className="font-display">Studio <span className="text-gold">RD</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Barbearia premium. Imagem, experiência e exclusividade.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Navegação</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Serviços</li><li>RD Black</li><li>Depoimentos</li><li>Contato</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Studio</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Sobre</li><li>Equipe</li><li>Trabalhe conosco</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3">Contato</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Rua das Flores, 100</li><li>(11) 99999-0000</li><li>contato@studiord.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Studio RD. Todos os direitos reservados.</span>
          <span>Feito com cuidado.</span>
        </div>
      </div>
    </footer>
  );
}
