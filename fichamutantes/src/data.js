export const abilities = [
  { key: "for", label: "Força" },
  { key: "des", label: "Destreza" },
  { key: "con", label: "Constituição" },
  { key: "int", label: "Inteligência" },
  { key: "sab", label: "Sabedoria" },
  { key: "car", label: "Carisma" },
];

export const skills = [
  ["Acrobacia", "DES"],
  ["Arte da Fuga", "DES"],
  ["Blefar", "CAR"],
  ["Cavalgar", "DES"],
  ["Computadores†", "INT"],
  ["Concentração", "SAB"],
  ["Conhecimento†", "INT"],
  ["Conhecimento†", "INT"],
  ["Conhecimento†", "INT"],
  ["Conhecimento†", "INT"],
  ["Desarmar dispositivo†", "INT"],
  ["Diplomacia", "CAR"],
  ["Dirigir†", "DES"],
  ["Disfarce", "CAR"],
  ["Escalar", "FOR"],
  ["Furtividade", "DES"],
  ["Idiomas†", "—"],
  ["Intimidar", "CAR"],
  ["Intuir intenção", "SAB"],
  ["Investigar", "INT"],
  ["Lidar com animais", "CAR"],
  ["Medicina", "SAB"],
  ["Nadar", "FOR"],
  ["Notar", "SAB"],
  ["Obter informação", "CAR"],
  ["Ofício†", "INT"],
  ["Ofício†", "INT"],
  ["Ofício†", "INT"],
  ["Ofício†", "INT"],
  ["Performance†", "CAR"],
  ["Performance†", "CAR"],
  ["Pilotar†", "DES"],
  ["Prestidigitação†", "DES"],
  ["Procurar", "INT"],
  ["Profissão†", "SAB"],
  ["Sobrevivência", "SAB"],
];

export const powers = Array.from({ length: 7 }, (_, index) => index + 1);
export const feats = Array.from({ length: 7 }, (_, index) => index + 1);

export const saveRows = [
  { key: "resistencia", label: "Resistência", ability: "con" },
  { key: "fortitude", label: "Fortitude", ability: "con" },
  { key: "reflexo", label: "Reflexo", ability: "des" },
  { key: "vontade", label: "Vontade", ability: "sab" },
];

export const conditionGroups = [
  {
    label: "Machucado",
    fields: ["machucado-1", "machucado-2"],
  },
  {
    label: "Abatido",
    fields: ["abatido-1", "abatido-2"],
  },
  {
    label: "Inconsciente",
    fields: ["inconsciente-dano"],
  },
  {
    label: "Ferido",
    fields: ["ferido"],
  },
  {
    label: "Desabilitado",
    fields: ["desabilitado"],
  },
  {
    label: "Moribundo",
    fields: ["moribundo"],
  },
];

export const fatigueGroups = [
  ["Fatigado", "fatigado"],
  ["Exausto", "exausto"],
  ["Inconsciente", "inconsciente-fadiga"],
];
