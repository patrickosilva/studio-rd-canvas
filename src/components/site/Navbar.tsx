import { Link } from "@tanstack/react-router";
import { Scissors, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-gradient-gold grid place-items-center">
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </span>
          <span className="font-display text-base tracking-tight">
            Studio <span className="text-gold">RD</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#servicos" className="hover:text-foreground transition">Serviços</a>
          <a href="#black" className="hover:text-foreground transition">RD Black</a>
          <a href="#depoimentos" className="hover:text-foreground transition">Depoimentos</a>
          <Link to="/cliente" className="hover:text-foreground transition">Área do Cliente</Link>
          <Link to="/admin" className="hover:text-foreground transition">Admin</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/cliente"
            className="hidden md:inline-flex items-center h-9 px-4 rounded-full bg-gold text-gold-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Agendar
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 -mr-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm">
            <a href="#servicos">Serviços</a>
            <a href="#black">RD Black</a>
            <a href="#depoimentos">Depoimentos</a>
            <Link to="/cliente">Área do Cliente</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      )}
    </header>
  );
}
