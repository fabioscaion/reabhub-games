"use client";

import Link from "next/link";
import { useState } from "react";
import LegalModals from "./LegalModals";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/games" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase">
                Reab<span className="text-red-600">Hub</span>
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              A maior plataforma de jogos terapêuticos para fonoaudiologia. 
              Desenvolvemos ferramentas inovadoras para auxiliar no tratamento e 
              desenvolvimento de pacientes de todas as idades.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/games" className="text-zinc-400 hover:text-red-500 transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-zinc-400 hover:text-red-500 transition-colors text-sm">
                  Enviar Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Support */}
          <div>
            <h4 className="text-white font-bold mb-6">Suporte</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => setIsTermsOpen(true)}
                  className="text-zinc-400 hover:text-red-500 transition-colors text-sm"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-zinc-400 hover:text-red-500 transition-colors text-sm"
                >
                  Privacidade
                </button>
              </li>
              <li>
                <a href="mailto:contato@reabhub.com" className="text-zinc-400 hover:text-red-500 transition-colors text-sm">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            © {currentYear} ReabHub. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-zinc-500 text-xs flex items-center gap-1">
              Desenvolvido com <span className="text-red-600">❤️</span> para Reabilitação
            </p>
          </div>
        </div>
      </div>

      <LegalModals 
        termsOpen={isTermsOpen}
        privacyOpen={isPrivacyOpen}
        closeTerms={() => setIsTermsOpen(false)}
        closePrivacy={() => setIsPrivacyOpen(false)}
      />
    </footer>
  );
}
