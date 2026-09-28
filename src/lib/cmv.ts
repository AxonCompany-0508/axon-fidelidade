/**
 * Toda a conta da calculadora de CMV fica aqui.
 * Nenhuma tela faz matemática por conta própria.
 */

/** Como o dono compra o ingrediente. */
export type Medida = "peso" | "volume" | "pacote";

export type Ingrediente = {
  id: string;
  nome: string;
  medida: Medida;
  /** Preço do quilo, do litro ou do pacote inteiro. */
  precoCompra: number;
  /** Só para "pacote": quantas unidades vêm dentro. */
  unidadesNoPacote: number;
  /** Quanto entra no prato: gramas, ml ou unidades. */
  quantidadeUsada: number;
};

export type Segmento = {
  id: string;
  nome: string;
  /** Faixa de CMV considerada saudável no ramo, em %. */
  cmvMin: number;
  cmvMax: number;
  /** Alvo sugerido quando o dono não souber o que colocar. */
  alvo: number;
  nota: string;
};

export const SEGMENTOS: Segmento[] = [
  {
    id: "hamburgueria",
    nome: "Hamburgueria",
    cmvMin: 28,
    cmvMax: 34,
    alvo: 31,
    nota: "Pão e blend são os que mais sobem de preço. Reveja a ficha a cada 3 meses."
  },
  {
    id: "pizzaria",
    nome: "Pizzaria",
    cmvMin: 24,
    cmvMax: 30,
    alvo: 27,
    nota: "Muçarela é quase metade do custo. Meio a meio quase sempre sai no prejuízo se cobrar o preço da mais barata."
  },
  {
    id: "delivery",
    nome: "Delivery / marmitaria",
    cmvMin: 30,
    cmvMax: 36,
    alvo: 33,
    nota: "Embalagem pesa muito aqui. Conte marmita, saco, talher e sachê."
  },
  {
    id: "bar",
    nome: "Bar / petiscaria",
    cmvMin: 30,
    cmvMax: 36,
    alvo: 33,
    nota: "Bebida segura a margem. Porção frita costuma ser a que mais sangra."
  },
  {
    id: "doceria",
    nome: "Açaí / sorveteria / doceria",
    cmvMin: 25,
    cmvMax: 32,
    alvo: 28,
    nota: "Complemento à vontade é o maior furo. Meça o quanto sai de verdade por copo."
  },
  {
    id: "casa_de_carnes",
    nome: "Casa de carnes / açougue",
    cmvMin: 68,
    cmvMax: 78,
    alvo: 73,
    nota: "Aqui é revenda, então o CMV é naturalmente alto. O que mata é a perda: apare, osso e o que estraga."
  },
  {
    id: "outro",
    nome: "Outro",
    cmvMin: 28,
    cmvMax: 35,
    alvo: 32,
    nota: "Faixa geral de food service."
  }
];

export function segmentoPor(id: string): Segmento {
  return SEGMENTOS.find((s) => s.id === id) || SEGMENTOS[SEGMENTOS.length - 1];
}

/** Custo de um ingrediente dentro do prato. */
export function custoIngrediente(i: Ingrediente): number {
  const preco = Number(i.precoCompra) || 0;
  const usa = Number(i.quantidadeUsada) || 0;

  if (i.medida === "pacote") {
    const vem = Number(i.unidadesNoPacote) || 0;
    if (vem <= 0) return 0;
    return (preco / vem) * usa;
  }

  // Peso: preço do quilo, uso em gramas. Volume: preço do litro, uso em ml.
  return (preco / 1000) * usa;
}

export type Resultado = {
  custoIngredientes: number;
  custoEmbalagem: number;
  custoTotal: number;
  /** O que realmente cai no caixa depois da comissão do aplicativo. */
  receitaLiquida: number;
  comissaoValor: number;
  /** CMV clássico: custo sobre o preço de venda. */
  cmvPreco: number;
  /** CMV sobre o que entra no caixa. É esse que manda quando tem app. */
  cmvLiquido: number;
  sobraPorPrato: number;
  margemPct: number;
  /** Preço que o prato precisaria ter para bater o CMV alvo. */
  precoIdeal: number;
  /** Preço em que o prato apenas empata, sem lucro nenhum. */
  precoEmpate: number;
  sobraNoMes: number;
  sobraNoMesIdeal: number;
};

export type Entradas = {
  ingredientes: Ingrediente[];
  custoEmbalagem: number;
  precoVenda: number;
  comissaoApp: number;
  cmvAlvo: number;
  vendasPorDia: number;
  diasPorMes: number;
};

export function calcular(e: Entradas): Resultado {
  const custoIngredientes = e.ingredientes.reduce((s, i) => s + custoIngrediente(i), 0);
  const custoEmbalagem = Number(e.custoEmbalagem) || 0;
  const custoTotal = custoIngredientes + custoEmbalagem;

  const preco = Number(e.precoVenda) || 0;
  const com = Math.min(Math.max(Number(e.comissaoApp) || 0, 0), 90) / 100;

  const comissaoValor = preco * com;
  const receitaLiquida = preco - comissaoValor;

  const cmvPreco = preco > 0 ? (custoTotal / preco) * 100 : 0;
  const cmvLiquido = receitaLiquida > 0 ? (custoTotal / receitaLiquida) * 100 : 0;

  const sobraPorPrato = receitaLiquida - custoTotal;
  const margemPct = preco > 0 ? (sobraPorPrato / preco) * 100 : 0;

  const alvo = Math.min(Math.max(Number(e.cmvAlvo) || 0, 1), 95) / 100;
  // Queremos custo / (preço * (1 - comissão)) = alvo
  const precoIdeal = alvo > 0 && 1 - com > 0 ? custoTotal / (alvo * (1 - com)) : 0;
  const sobraIdeal = precoIdeal * (1 - com) - custoTotal;

  const porMes = (Number(e.vendasPorDia) || 0) * (Number(e.diasPorMes) || 0);

  return {
    custoIngredientes,
    custoEmbalagem,
    custoTotal,
    receitaLiquida,
    comissaoValor,
    cmvPreco,
    cmvLiquido,
    sobraPorPrato,
    margemPct,
    precoIdeal,
    precoEmpate: 1 - com > 0 ? custoTotal / (1 - com) : custoTotal,
    sobraNoMes: sobraPorPrato * porMes,
    sobraNoMesIdeal: sobraIdeal * porMes
  };
}

export type Veredito = {
  cor: "folha" | "mel" | "tomate";
  titulo: string;
  texto: string;
};

/** A leitura do resultado em linguagem de dono de loja, não de contador. */
export function veredito(r: Resultado, s: Segmento, temApp: boolean): Veredito | null {
  const cmv = temApp ? r.cmvLiquido : r.cmvPreco;
  if (!isFinite(cmv) || cmv <= 0) return null;

  const onde = temApp ? "descontando a comissão do aplicativo" : "sobre o preço de venda";

  if (r.sobraPorPrato < 0) {
    return {
      cor: "tomate",
      titulo: "Esse prato está dando prejuízo",
      texto: `Cada vez que ele sai, a loja perde ${brl(Math.abs(r.sobraPorPrato))}. Vender mais só aumenta o buraco. Para empatar, sem lucro nenhum, o preço mínimo é ${brl(r.precoEmpate)}.`
    };
  }

  if (cmv > s.cmvMax + 4) {
    return {
      cor: "tomate",
      titulo: `CMV em ${cmv.toFixed(1)}% — bem acima do ramo`,
      texto: `${s.nome} saudável fica entre ${s.cmvMin}% e ${s.cmvMax}% ${onde}. Cada ponto a mais sai do que deveria pagar aluguel, folha e energia. Dá para resolver por dois lados: cortar custo do prato (rever gramatura, trocar fornecedor, negociar o item mais caro) ou subir o preço. Na prática, os dois ao mesmo tempo doem menos no cliente.`
    };
  }

  if (cmv > s.cmvMax) {
    return {
      cor: "mel",
      titulo: `CMV em ${cmv.toFixed(1)}% — um pouco acima`,
      texto: `A faixa saudável de ${s.nome.toLowerCase()} é ${s.cmvMin}% a ${s.cmvMax}%. Está perto, mas apertado: um aumento de fornecedor e esse prato vira problema. ${s.nota}`
    };
  }

  if (cmv < s.cmvMin - 6) {
    return {
      cor: "mel",
      titulo: `CMV em ${cmv.toFixed(1)}% — bem abaixo do ramo`,
      texto: `Ou a ficha está incompleta — falta tempero, óleo, queijo do fundo da chapa ou a embalagem — ou o preço está alto para a região. Vale conferir antes de comemorar.`
    };
  }

  return {
    cor: "folha",
    titulo: `CMV em ${cmv.toFixed(1)}% — dentro do saudável`,
    texto: `${s.nome} trabalha bem entre ${s.cmvMin}% e ${s.cmvMax}% ${onde}. Esse prato está no lugar. ${s.nota}`
  };
}

export function brl(v: number): string {
  if (!isFinite(v)) return "R$ 0,00";
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}

export function pct(v: number): string {
  if (!isFinite(v)) return "0%";
  return `${v.toFixed(1).replace(".", ",")}%`;
}

/** Rótulos dos campos conforme a medida escolhida. */
export function rotulos(m: Medida) {
  if (m === "peso") {
    return { preco: "Preço do quilo", usa: "Quanto usa (g)", sufixo: "g" };
  }
  if (m === "volume") {
    return { preco: "Preço do litro", usa: "Quanto usa (ml)", sufixo: "ml" };
  }
  return { preco: "Preço do pacote", usa: "Quantas usa", sufixo: "un" };
}
