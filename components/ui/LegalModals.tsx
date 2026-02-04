"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm leading-relaxed space-y-6">
            {content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

interface LegalModalsProps {
  termsOpen: boolean;
  privacyOpen: boolean;
  closeTerms: () => void;
  closePrivacy: () => void;
}

export default function LegalModals({ termsOpen, privacyOpen, closeTerms, closePrivacy }: LegalModalsProps) {
  return (
    <>
      {/* Terms of Use */}
      <LegalModal
        isOpen={termsOpen}
        onClose={closeTerms}
        title="Termos de Uso"
        content={
          <>
            <section>
              <h4 className="text-white font-bold mb-2">1. Aceitação dos Termos</h4>
              <p>Ao acessar e utilizar a plataforma ReabHub, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">2. Uso da Plataforma</h4>
              <p>A ReabHub é uma ferramenta de auxílio terapêutico. O uso dos jogos e atividades deve ser supervisionado por profissionais qualificados quando aplicável. É proibido o uso da plataforma para fins ilícitos ou que violem direitos de terceiros.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">3. Propriedade Intelectual</h4>
              <p>Todo o conteúdo disponível na ReabHub, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio e software, é de propriedade exclusiva da ReabHub ou de seus licenciadores e está protegido por leis internacionais de direitos autorais.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">4. Cadastro e Segurança</h4>
              <p>Você é responsável por manter a confidencialidade de sua conta e senha. Qualquer atividade realizada através de sua conta será de sua inteira responsabilidade.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">5. Limitação de Responsabilidade</h4>
              <p>A ReabHub não se responsabiliza por danos diretos, indiretos ou consequentes resultantes do uso ou da incapacidade de usar a plataforma.</p>
            </section>
          </>
        }
      />

      {/* Privacy Policy */}
      <LegalModal
        isOpen={privacyOpen}
        onClose={closePrivacy}
        title="Política de Privacidade"
        content={
          <>
            <section>
              <h4 className="text-white font-bold mb-2">1. Coleta de Informações</h4>
              <p>Coletamos informações necessárias para a prestação de nossos serviços, como nome, e-mail e dados de progresso nos jogos, sempre com o seu consentimento.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">2. Uso dos Dados</h4>
              <p>Os dados coletados são utilizados para personalizar a experiência do usuário, monitorar o progresso terapêutico e melhorar continuamente nossas ferramentas e serviços.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">3. Compartilhamento de Informações</h4>
              <p>Não vendemos ou alugamos suas informações pessoais a terceiros. O compartilhamento de dados ocorre apenas em conformidade com a lei ou para a prestação essencial de nossos serviços.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">4. Segurança dos Dados</h4>
              <p>Implementamos medidas de segurança técnicas e administrativas para proteger seus dados pessoais contra acesso não autorizado, perda ou alteração.</p>
            </section>
            <section>
              <h4 className="text-white font-bold mb-2">5. Seus Direitos</h4>
              <p>Você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento, entrando em contato conosco através dos canais de suporte.</p>
            </section>
          </>
        }
      />
    </>
  );
}
