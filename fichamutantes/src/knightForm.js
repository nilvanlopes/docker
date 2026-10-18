import { featCatalog } from "./featsCatalog.js";

// Dados transcritos de rpg/MM/Cavaleiro Joao.md.
// Os campos não informados na ficha original permanecem vazios.
export const knightForm = {
  "nome-personagem": "Cavaleiro João",
  "grupo": "Cavaleiros Imortais",
  "nivel-poder": "8",
  "pontos-poder-p2": "139",
  "pontos-poder": "139",
  "pontos-heroi": "3",

  // Habilidades: a ficha de origem informa o valor total; aqui ele fica no valor base.
  "for-base": "18",
  "des-base": "18",
  "con-base": "18",
  "int-base": "12",
  "sab-base": "14",
  "car-base": "12",

  // O modificador de habilidade é calculado pelo formulário.
  // Os valores abaixo são as compras/bonificações indicadas na ficha original.
  "resistencia-base": "0",
  "resistencia-outros": "2",
  "fortitude-base": "0",
  "fortitude-outros": "2",
  "reflexo-base": "0",
  "reflexo-outros": "0",
  "vontade-base": "0",
  "vontade-outros": "3",

  "defesa-base": "6",
  "defesa-outros": "0",
  "defesa-desprevenido": "0",
  "iniciativa-dex": "0",
  "iniciativa-feito": "0",
  "iniciativa-poder": "0",
  "ataque-corpo-corpo": "6",
  "ataque-distancia": "6",

  "equipment-1": "Manopla dos Cavaleiros Imortais — graduação 5; custo na ficha: 20 pontos.",
  "equipment-2": "Golpe 6; Penetrante 5; Escudo 4; Proteção 2.",
  "equipment-3": "Poder alternativo: Raio 8; Imóvel; Super Força +5 por graduação.",

  // Poderes e dispositivos.
  "poder-1-nome": "Manopla dos Cavaleiros Imortais",
  "poder-1-graduacao": "5",
  "poder-1-descricao": "Golpe 6; Penetrante 5; Escudo 4; Proteção 2; Feitos: Restrito, Pujante e Afeta Intangível; Poder alternativo: Raio 8; Imóvel; Super Força +5 por graduação. Custo na ficha: 20 pontos.",
  "poder-2-nome": "Magia",
  "poder-2-graduacao": "1",
  "poder-2-descricao": "Fortalecer 1. Custo: 2 pontos.",
  "poder-3-nome": "Sentido de Perigo",
  "poder-3-graduacao": "2",
  "poder-3-descricao": "Afeta Outros e Estendido. Custo total: 4 pontos.",
  "poder-4-nome": "Raio (Poder Alternativo)",
  "poder-4-graduacao": "8",
  "poder-4-descricao": "Ataque à distância da Manopla dos Cavaleiros Imortais.",

  // Feitos que cabem nas 14 linhas da ficha editável.
  "feito-1-nome": "Ação em movimento",
  "feito-1-beneficio": "1 graduação — pode se mover antes e depois da ação padrão.",
  "feito-1b-nome": "Agarrar aprimorado",
  "feito-1b-beneficio": "1 graduação — agarra com uma mão e mantém a outra livre.",
  "feito-2-nome": "Agarrar Instantâneo",
  "feito-2-beneficio": "1 graduação — agarra imediatamente após acertar um ataque desarmado.",
  "feito-2b-nome": "Agarrar Preciso",
  "feito-2b-beneficio": "1 graduação — usa Destreza em testes de agarrar e mantém o bônus de esquiva.",
  "feito-3-nome": "Alvo esquivo",
  "feito-3-beneficio": "1 graduação — ataques à distância de outros oponentes sofrem -8 em corpo a corpo.",
  "feito-3b-nome": "Arremessar aprimorado",
  "feito-3b-beneficio": "1 graduação — escolhe Força ou Destreza para a defesa contra derrubar.",
  "feito-4-nome": "Ataque acurado",
  "feito-4-beneficio": "1 graduação — troca até -5 na CD do salvamento por bônus de ataque.",
  "feito-4b-nome": "Ataque atordoante",
  "feito-4b-beneficio": "1 graduação — troca dano por um salvamento de Fortitude contra atordoamento.",
  "feito-5-nome": "Ataque defensivo",
  "feito-5-beneficio": "1 graduação — troca até -5 no ataque por bônus de esquiva na Defesa.",
  "feito-5b-nome": "Ataque dominó",
  "feito-5b-beneficio": "2 graduações — ganha ataque extra imediato após nocautear um oponente.",
  "feito-6-nome": "Ataque imprudente",
  "feito-6-beneficio": "1 graduação — troca até -5 na Defesa por bônus de ataque.",
  "feito-6b-nome": "Ataque poderoso",
  "feito-6b-beneficio": "1 graduação — troca até -5 no ataque por bônus na CD do salvamento.",
  "feito-7-nome": "Atropelar",
  "feito-7-beneficio": "1 graduação — o alvo não pode escolher evitar; +4 no teste de derrubar.",
  "feito-7b-nome": "Bloquear Aprimorado",
  "feito-7b-beneficio": "2 graduações — +2 nas rolagens de bloqueio corpo a corpo.",

  // Perícias: o índice corresponde à ordem exibida na ficha editável.
  "graduacoes-maximas": "8",
  "skill-1-rank": "2",   // Acrobacia: 2 + DES 4 = 6
  "skill-6-rank": "2",   // Concentração: 2 + SAB 2 = 4
  "skill-7-rank": "8",   // Conhecimento (arcano): a origem registra graduação 8 e total 10
  "skill-7-other": "1",  // compensa a divergência entre o total (+10) e o modificador listado (+2)
  "skill-13-rank": "8",  // Dirigir: 8 + DES 4 = 12
  "skill-16-rank": "4",  // Furtividade: 4 + DES 4 = 8
  "skill-19-rank": "4",  // Intuir intenção: 4 + SAB 2 = 6
  "skill-23-rank": "4",  // Nadar
  "skill-23-other": "-1", // ajuste da ficha de origem: 4 + 4 - 1 = 7
  "skill-24-rank": "4",  // Notar: 4 + SAB 2 = 6
  "skill-26-rank": "8",  // Ofício (mecânico): 8 + INT 1 = 9
};

// A nota do Cavaleiro lista estes 32 feitos, nesta ordem e com estas graduações.
const knightFeatRanks = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1];

featCatalog.forEach((feat, index) => {
  const row = Math.floor(index / 2) + 1;
  const suffix = index % 2 === 0 ? "" : "b";
  knightForm[`feito-${row}${suffix}-nome`] = feat.name;
  knightForm[`feito-${row}${suffix}-beneficio`] = feat.benefit;
  knightForm[`feito-${row}${suffix}-graduacao`] = String(knightFeatRanks[index]);
});
