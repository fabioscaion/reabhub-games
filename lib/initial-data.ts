import { GameConfig } from "@/types/game";

export const MOCK_GAMES: Record<string, GameConfig> = {
  // === CATEGORIA: LINGUAGEM EXPRESSIVA ===
  
  // Game 1: Animais da Fazenda (Nomeação)
  "123e4567-e89b-12d3-a456-426614174001": {
    id: "123e4567-e89b-12d3-a456-426614174001",
    name: "Animais da Fazenda",
    description: "Nomeie os animais corretamente.",
    type: "naming",
    category: "Linguagem Expressiva",
    coverImage: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=80", 
          alt: "Carro azul" // Note: URL is car, but context says animal? Fixed below in actual usage
        },
        options: [
          { id: "o1", content: { type: "text", value: "Caminhão" }, isCorrect: false },
          { id: "o2", content: { type: "text", value: "Carro" }, isCorrect: true },
          { id: "o3", content: { type: "text", value: "Moto" }, isCorrect: false },
          { id: "o4", content: { type: "text", value: "Bicicleta" }, isCorrect: false },
        ]
      },
      {
        id: "l2",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?auto=format&fit=crop&w=500&q=80",
          alt: "Gato"
        },
        options: [
          { id: "o1", content: { type: "text", value: "Gato" }, isCorrect: true },
          { id: "o2", content: { type: "text", value: "Cachorro" }, isCorrect: false },
          { id: "o3", content: { type: "text", value: "Pássaro" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 4: Ações do Dia a Dia (Verbos/Nomeação)
  "123e4567-e89b-12d3-a456-426614174004": {
    id: "123e4567-e89b-12d3-a456-426614174004",
    name: "O que eles estão fazendo?",
    description: "Identifique a ação correta.",
    type: "naming",
    category: "Linguagem Expressiva",
    coverImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&q=80",
          alt: "Pessoa lendo"
        },
        options: [
          { id: "o1", content: { type: "text", value: "Lendo" }, isCorrect: true },
          { id: "o2", content: { type: "text", value: "Comendo" }, isCorrect: false },
          { id: "o3", content: { type: "text", value: "Dormindo" }, isCorrect: false },
        ]
      },
      {
        id: "l2",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=500&q=80",
          alt: "Criança correndo"
        },
        options: [
          { id: "o1", content: { type: "text", value: "Nadando" }, isCorrect: false },
          { id: "o2", content: { type: "text", value: "Correndo" }, isCorrect: true },
          { id: "o3", content: { type: "text", value: "Sentada" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 5: Emoções (Identificação)
  "123e4567-e89b-12d3-a456-426614174005": {
    id: "123e4567-e89b-12d3-a456-426614174005",
    name: "Identificando Emoções",
    description: "Como a pessoa está se sentindo?",
    type: "naming",
    category: "Linguagem Expressiva",
    coverImage: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1542596594-649edbc13630?auto=format&fit=crop&w=500&q=80",
          alt: "Rosto feliz"
        },
        options: [
          { id: "o1", content: { type: "text", value: "Tristeza" }, isCorrect: false },
          { id: "o2", content: { type: "text", value: "Alegria" }, isCorrect: true },
          { id: "o3", content: { type: "text", value: "Raiva" }, isCorrect: false },
        ]
      },
      {
        id: "l2",
        stimulus: {
          type: "image",
          value: "https://images.unsplash.com/photo-1563332463-54747c320857?auto=format&fit=crop&w=500&q=80",
          alt: "Rosto triste"
        },
        options: [
          { id: "o1", content: { type: "text", value: "Tristeza" }, isCorrect: true },
          { id: "o2", content: { type: "text", value: "Medo" }, isCorrect: false },
          { id: "o3", content: { type: "text", value: "Surpresa" }, isCorrect: false },
        ]
      }
    ]
  },

  // === CATEGORIA: COMPREENSÃO AUDITIVA/VISUAL ===

  // Game 2: Encontre o Objeto (Compreensão)
  "123e4567-e89b-12d3-a456-426614174002": {
    id: "123e4567-e89b-12d3-a456-426614174002",
    name: "Encontre o Objeto",
    description: "Leia a palavra e clique na imagem correta.",
    type: "comprehension",
    category: "Compreensão Visual",
    coverImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Bola" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80", alt: "Bola de Futebol" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80", alt: "Boneca" }, isCorrect: false },
          { id: "o3", content: { type: "image", value: "https://images.unsplash.com/photo-1509205477838-a534e43a849f?auto=format&fit=crop&w=300&q=80", alt: "Óculos" }, isCorrect: false },
        ]
      },
      {
        id: "l2",
        stimulus: { type: "text", value: "Cachorro" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&q=80", alt: "Gato" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=300&q=80", alt: "Cachorro" }, isCorrect: true },
        ]
      }
    ]
  },

  // Game 6: Cores (Compreensão)
  "123e4567-e89b-12d3-a456-426614174006": {
    id: "123e4567-e89b-12d3-a456-426614174006",
    name: "Aprendendo as Cores",
    description: "Identifique as cores solicitadas.",
    type: "comprehension",
    category: "Compreensão Visual",
    coverImage: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Vermelho" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1603522617637-8b54b0357f86?auto=format&fit=crop&w=300&q=80", alt: "Objeto verde" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1588160010156-32d23c524028?auto=format&fit=crop&w=300&q=80", alt: "Objeto vermelho" }, isCorrect: true },
          { id: "o3", content: { type: "image", value: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=300&q=80", alt: "Objeto azul" }, isCorrect: false },
        ]
      },
      {
        id: "l2",
        stimulus: { type: "text", value: "Azul" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=300&q=80", alt: "Objeto azul" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1588160010156-32d23c524028?auto=format&fit=crop&w=300&q=80", alt: "Objeto vermelho" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 7: Tamanhos (Conceitos)
  "123e4567-e89b-12d3-a456-426614174007": {
    id: "123e4567-e89b-12d3-a456-426614174007",
    name: "Grande e Pequeno",
    description: "Diferencie os tamanhos.",
    type: "comprehension",
    category: "Compreensão Visual",
    coverImage: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Maior" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80", alt: "Cachorro pequeno" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=300&q=80", alt: "Elefante" }, isCorrect: true },
        ]
      }
    ]
  },

  // === CATEGORIA: PROCESSAMENTO FONOLÓGICO ===

  // Game 8: Rimas (Associação)
  "123e4567-e89b-12d3-a456-426614174008": {
    id: "123e4567-e89b-12d3-a456-426614174008",
    name: "Hora da Rima",
    description: "O que rima com a imagem?",
    type: "association",
    category: "Processamento Fonológico",
    coverImage: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { 
          type: "image", 
          value: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80",
          alt: "Gato" 
        },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=300&q=80", alt: "Elefante" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=300&q=80", alt: "Pato" }, isCorrect: true },
        ]
      },
      {
        id: "l2",
        stimulus: { 
          type: "image", 
          value: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80",
          alt: "Mão" 
        },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=300&q=80", alt: "Gato" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1509721434272-b79147e0e708?auto=format&fit=crop&w=300&q=80", alt: "Pão" }, isCorrect: true },
        ]
      }
    ]
  },

  // Game 9: Letra Inicial (Associação)
  "123e4567-e89b-12d3-a456-426614174009": {
    id: "123e4567-e89b-12d3-a456-426614174009",
    name: "Letra Inicial",
    description: "Com qual letra começa?",
    type: "association",
    category: "Processamento Fonológico",
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Letra A" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1555543027-e17537b988f1?auto=format&fit=crop&w=300&q=80", alt: "Abelha" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&q=80", alt: "Gato" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 10: Sílaba Tônica (Compreensão - simulada)
  "123e4567-e89b-12d3-a456-426614174010": {
    id: "123e4567-e89b-12d3-a456-426614174010",
    name: "Sílaba Forte",
    description: "Identifique a sílaba tônica.",
    type: "comprehension",
    category: "Processamento Fonológico",
    coverImage: "https://images.unsplash.com/photo-1453906971074-ce568cccbc63?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "CAFÉ" },
        options: [
          { id: "o1", content: { type: "text", value: "CA" }, isCorrect: false },
          { id: "o2", content: { type: "text", value: "FÉ" }, isCorrect: true },
        ]
      }
    ]
  },

  // === CATEGORIA: HABILIDADES COGNITIVAS ===

  // Game 3: Association (Associação)
  "123e4567-e89b-12d3-a456-426614174003": {
    id: "123e4567-e89b-12d3-a456-426614174003",
    name: "O que combina?",
    description: "Associe os itens que pertencem ao mesmo grupo.",
    type: "association",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { 
          type: "image", 
          value: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80", 
          alt: "Chuva" 
        },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=300&q=80", alt: "Guarda-chuva" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1540428085538-3f5f3e970221?auto=format&fit=crop&w=300&q=80", alt: "Óculos de sol" }, isCorrect: false },
          { id: "o3", content: { type: "image", value: "https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=300&q=80", alt: "Sorvete" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 11: Categorização (Associação)
  "123e4567-e89b-12d3-a456-426614174011": {
    id: "123e4567-e89b-12d3-a456-426614174011",
    name: "Categorização",
    description: "Qual item pertence à categoria?",
    type: "association",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1610847038753-e3805d4f3b82?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Fruta" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=300&q=80", alt: "Cenoura" }, isCorrect: false },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80", alt: "Maçã" }, isCorrect: true },
          { id: "o3", content: { type: "image", value: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80", alt: "Bola" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 12: O Intruso (Associação Lógica)
  "123e4567-e89b-12d3-a456-426614174012": {
    id: "123e4567-e89b-12d3-a456-426614174012",
    name: "Qual é o Intruso?",
    description: "Descubra qual não pertence ao grupo.",
    type: "association",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Animais" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80", alt: "Carro" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=300&q=80", alt: "Gato" }, isCorrect: false },
          { id: "o3", content: { type: "image", value: "https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?auto=format&fit=crop&w=300&q=80", alt: "Cachorro" }, isCorrect: false },
        ]
      }
    ]
  },

  // Game 13: Memória Visual (Associação - simulada)
  "123e4567-e89b-12d3-a456-426614174013": {
    id: "123e4567-e89b-12d3-a456-426614174013",
    name: "Memória Visual",
    description: "Onde estava o objeto?",
    type: "association",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        stimulus: { type: "text", value: "Memória" },
        options: [
          { id: "o1", content: { type: "image", value: "https://images.unsplash.com/photo-1508057198894-247b6d788d71?auto=format&fit=crop&w=300&q=80", alt: "Relógio" }, isCorrect: true },
          { id: "o2", content: { type: "image", value: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=300&q=80", alt: "Telefone" }, isCorrect: false },
        ]
      }
    ]
  },

  // === CATEGORIA: HABILIDADES COGNITIVAS (NOVOS TIPOS) ===
  
  // Game: Ciclo da Planta (Sequenciamento)
  "seq-001": {
    id: "seq-001",
    name: "Ciclo da Planta",
    description: "Coloque as fases do crescimento da planta na ordem correta.",
    type: "sequencing",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        options: [
          { id: "o1", content: { type: "text", value: "1. Semente" }, isCorrect: true, order: 1 },
          { id: "o2", content: { type: "text", value: "2. Broto" }, isCorrect: true, order: 2 },
          { id: "o3", content: { type: "text", value: "3. Planta Pequena" }, isCorrect: true, order: 3 },
          { id: "o4", content: { type: "text", value: "4. Árvore" }, isCorrect: true, order: 4 }
        ]
      }
    ]
  },

  // Game: Memória dos Animais (Memória)
  "mem-001": {
    id: "mem-001",
    name: "Memória dos Animais",
    description: "Encontre os pares dos animais.",
    type: "memory",
    category: "Habilidades Cognitivas",
    coverImage: "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=500&q=80",
    levels: [
      {
        id: "l1",
        options: [
          { id: "o1", content: { type: "text", value: "🦁 Leão" }, isCorrect: true },
          { id: "o2", content: { type: "text", value: "🐘 Elefante" }, isCorrect: true },
          { id: "o3", content: { type: "text", value: "🦒 Girafa" }, isCorrect: true },
          { id: "o4", content: { type: "text", value: "🦓 Zebra" }, isCorrect: true }
        ]
      }
    ]
  }
};
