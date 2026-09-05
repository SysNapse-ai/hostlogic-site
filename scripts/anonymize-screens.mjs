/**
 * Anonimiza prints do app (PII real) e exporta WebP para public/screenshots/.
 *
 * Os originais (JPEG/PNG) NUNCA devem estar dentro deste repo. O script lê-os de
 * um diretório externo (env PRINTS_DIR, argumento --src, ou o default em
 * Downloads) e só escreve .webp anonimizados.
 *
 * Uso:
 *   node scripts/anonymize-screens.mjs
 *   PRINTS_DIR=/caminho/externo node scripts/anonymize-screens.mjs
 *   node scripts/anonymize-screens.mjs --src /caminho/externo
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'public', 'screenshots');

const DEFAULT_SRC = '/mnt/c/Users/HL/Downloads/prints_app';
const MAX_WIDTH = 640;
const WEBP_QUALITY = 82;

const FONT =
  'DejaVu Sans, Liberation Sans, Noto Sans, Arial, Helvetica, sans-serif';

/**
 * Nomes e endereços fictícios (parecidos com anúncio Airbnb, sem local real).
 * Não reutilizar Afonso Pena, São José dos Pinhais, aeroporto, ruas reais.
 */
const DEMO = {
  listingA: 'Recanto do Terminal',
  listingAShort: 'Recanto do Terminal co...',
  listingB: 'Ap charmoso-próx estação CW...',
  listingC: 'Vista jardim! Prox Termin...',
  listingD: 'Jardim Urbano! próximo à...',
  listingE: 'Portal da Estação - B',
  listingLong: 'Jardim Urbano! próximo ao terminal c vaga',
  listingAVaga: 'Recanto do Terminal com vaga',
  wifiSsid: 'DEMO_WIFI',
  wifiPass: 'hospede-demo',
  place: 'Torre 2 · Jardim das Flores · Vila Nova',
  unit: 'BLOCO 12 · APTO 204',
  unitSoft: 'Bloco 08 · Apto 302',
  street: 'Rua das Palmeiras, 100',
  streetFull1: 'Rua das Palmeiras, 100 — Jardim das Flores —',
  streetFull2: 'Vila Nova · Bloco 08 · Apto 302',
  aptRecanto: 'Apt. Recanto',
  aptBosque: 'Apt. Bosque',
};

/** @typedef {{ t: 'rect', x: number, y: number, w: number, h: number, fill: string, rx?: number }} RectOp */
/** @typedef {{ t: 'text', x: number, y: number, text: string, size: number, fill?: string, weight?: number, anchor?: string }} TextOp */
/** @typedef {{ t: 'image', x: number, y: number, w: number, h: number, src: string, rx?: number }} ImageOp */
/** Desfoca a região do próprio original (para cartões translúcidos, onde um rect sólido destoaria). */
/** @typedef {{ t: 'blur', x: number, y: number, w: number, h: number, sigma?: number }} BlurOp */
/** @typedef {RectOp | TextOp | ImageOp | BlurOp} OverlayOp */

/** @type {{ time?: string, file?: string, slug: string, overlays: OverlayOp[] }[]} */
const JOBS = [
  {
    time: '14.17.06',
    slug: 'reserva-cartao',
    overlays: [
      // Barra do iPhone (relógio 14:16 + sinal/bateria) e fragmento cortado.
      { t: 'rect', x: 0, y: 0, w: 591, h: 62, fill: '#ffffff' },
      { t: 'rect', x: 108, y: 74, w: 430, h: 40, fill: '#fdfffe' },
      {
        t: 'text',
        x: 108,
        y: 102,
        text: DEMO.listingA,
        size: 18,
        weight: 700,
        fill: '#1a1d2e',
      },
      { t: 'rect', x: 44, y: 116, w: 510, h: 38, fill: '#fdfffe' },
      {
        t: 'text',
        x: 48,
        y: 142,
        text: DEMO.place,
        size: 13,
        fill: '#4b5563',
      },
      { t: 'rect', x: 308, y: 186, w: 248, h: 52, fill: '#f7f7f7' },
      {
        t: 'text',
        x: 432,
        y: 218,
        text: DEMO.unit,
        size: 14,
        weight: 700,
        fill: '#1a1d2e',
        anchor: 'middle',
      },
      // Código Airbnb no grelha (célula inferior esquerda)
      { t: 'rect', x: 118, y: 354, w: 164, h: 30, fill: '#ffffff' },
      {
        t: 'text',
        x: 136,
        y: 375,
        text: 'HMDEMO0001',
        size: 15,
        weight: 700,
        fill: '#1a1d2e',
      },
      // Nome do hóspede + nome na plataforma (caixa pêssego)
      { t: 'rect', x: 64, y: 428, w: 476, h: 78, fill: '#ffdacd' },
      {
        t: 'text',
        x: 86,
        y: 456,
        text: 'Marina Costa',
        size: 18,
        weight: 700,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 86,
        y: 492,
        text: 'Nome na plataforma: Ana Souza',
        size: 13,
        fill: '#4b5563',
      },
      // Valor pago
      { t: 'rect', x: 62, y: 1024, w: 480, h: 56, fill: '#ccf5e3', rx: 10 },
      {
        t: 'text',
        x: 302,
        y: 1058,
        text: 'PAGO R$ 1.280,00 VIA BANCO',
        size: 14,
        weight: 700,
        fill: '#0d5c3d',
        anchor: 'middle',
      },
    ],
  },
  {
    time: '14.22.14',
    slug: 'portfolio',
    overlays: [
      // Barra do iPhone (relógio 14:21 + sinal/bateria), fundo real #f1f2f7.
      { t: 'rect', x: 0, y: 0, w: 591, h: 62, fill: '#f1f2f7' },
      // Pills 1-3: APENAS as 2 linhas de nome (ícone e borda intactos).
      { t: 'rect', x: 56, y: 654, w: 124, h: 38, fill: 'auto' },
      { t: 'text', x: 118, y: 668, text: 'Ap charmoso-próx', size: 10, weight: 700, fill: '#7a2e2e', anchor: 'middle' },
      { t: 'text', x: 118, y: 684, text: 'estação CW...', size: 10, weight: 700, fill: '#7a2e2e', anchor: 'middle' },
      { t: 'rect', x: 240, y: 654, w: 124, h: 38, fill: 'auto' },
      { t: 'text', x: 302, y: 668, text: 'Vista jardim! Prox', size: 10, weight: 700, fill: '#7a2e2e', anchor: 'middle' },
      { t: 'text', x: 302, y: 684, text: 'Termin...', size: 10, weight: 700, fill: '#7a2e2e', anchor: 'middle' },
      { t: 'rect', x: 424, y: 654, w: 118, h: 38, fill: 'auto' },
      { t: 'text', x: 483, y: 668, text: 'Jardim Urbano!', size: 10, weight: 700, fill: '#6b4a1e', anchor: 'middle' },
      { t: 'text', x: 483, y: 684, text: 'próximo à...', size: 10, weight: 700, fill: '#6b4a1e', anchor: 'middle' },
      // Pills 4-5: só o nome; ícone no topo e cantos do card ficam.
      { t: 'rect', x: 56, y: 780, w: 124, h: 36, fill: 'auto' },
      { t: 'text', x: 118, y: 794, text: 'Portal da', size: 10, weight: 700, fill: '#6b4a1e', anchor: 'middle' },
      { t: 'text', x: 118, y: 810, text: 'Estação - B', size: 10, weight: 700, fill: '#6b4a1e', anchor: 'middle' },
      { t: 'rect', x: 240, y: 780, w: 124, h: 36, fill: 'auto' },
      { t: 'text', x: 302, y: 794, text: 'Recanto do', size: 10, weight: 700, fill: '#14532d', anchor: 'middle' },
      { t: 'text', x: 302, y: 810, text: 'Terminal co...', size: 10, weight: 700, fill: '#14532d', anchor: 'middle' },
      // Detalhe: texto do título/local/hóspede, sem cobrir grelha nem logo Airbnb.
      { t: 'rect', x: 110, y: 904, w: 320, h: 28, fill: 'auto' },
      {
        t: 'text',
        x: 114,
        y: 926,
        text: DEMO.listingA,
        size: 18,
        weight: 700,
        fill: '#1a1d2e',
      },
      { t: 'rect', x: 44, y: 948, w: 420, h: 22, fill: 'auto' },
      {
        t: 'text',
        x: 48,
        y: 965,
        text: DEMO.place,
        size: 13,
        fill: '#4b5563',
      },
      { t: 'rect', x: 124, y: 1026, w: 200, h: 20, fill: 'auto' },
      {
        t: 'text',
        x: 124,
        y: 1046,
        text: 'Marina Costa · HMDEMO0002',
        size: 14,
        fill: '#1a1d2e',
      },
    ],
  },
  {
    time: '14.42.21',
    slug: 'portal-home',
    overlays: [
      { t: 'rect', x: 108, y: 66, w: 220, h: 24, fill: '#ffffff' },
      {
        t: 'text',
        x: 218,
        y: 84,
        text: 'Reserva · HMDEMO0003',
        size: 13,
        fill: '#4b5563',
        anchor: 'middle',
      },
      { t: 'rect', x: 28, y: 326, w: 240, h: 24, fill: '#f8f9fb' },
      {
        t: 'text',
        x: 40,
        y: 344,
        text: 'RESERVA · HMDEMO0003',
        size: 12,
        fill: '#64748b',
      },
      { t: 'rect', x: 26, y: 348, w: 360, h: 40, fill: '#ffebce' },
      {
        t: 'text',
        x: 40,
        y: 376,
        text: 'Olá, Pedro Almeida!',
        size: 16,
        weight: 700,
        fill: '#1a1d2e',
      },
      // Título do imóvel: 2 linhas (y192-208 e y216-232), começa em x≈116.
      { t: 'rect', x: 110, y: 188, w: 250, h: 22, fill: '#ffffff' },
      {
        t: 'text',
        x: 116,
        y: 206,
        text: 'Jardim Urbano! próximo ao',
        size: 14,
        weight: 700,
        fill: '#1a1d2e',
      },
      { t: 'rect', x: 110, y: 212, w: 240, h: 22, fill: '#ffffff' },
      {
        t: 'text',
        x: 116,
        y: 230,
        text: 'terminal c vaga',
        size: 14,
        weight: 700,
        fill: '#1a1d2e',
      },
      // Linha do apto (y240-256), começa em x≈32; badge verde abaixo preservado.
      { t: 'rect', x: 26, y: 236, w: 230, h: 25, fill: '#ffffff' },
      {
        t: 'text',
        x: 32,
        y: 253,
        text: DEMO.unitSoft,
        size: 12,
        fill: '#64748b',
      },
      // Endereço: rótulo original (y573-583) preservado; só a linha do
      // endereço real (y597-607) é substituída.
      { t: 'rect', x: 24, y: 591, w: 280, h: 24, fill: '#ffffff' },
      {
        t: 'text',
        x: 68,
        y: 607,
        text: DEMO.street,
        size: 13,
        fill: '#4b5563',
      },
      {
        t: 'image',
        x: 20,
        y: 618,
        w: 410,
        h: 250,
        src: 'demo-map.png',
        rx: 8,
      },
    ],
  },
  {
    time: '14.43.23',
    slug: 'checkin-titular',
    overlays: [], // formulário vazio — só converter
  },
  {
    time: '12.05.54',
    slug: 'anfitri-ia-hospede',
    overlays: [
      // O relógio 12:05 do iPhone sobrepõe o título no original; cobrimos a
      // faixa toda (relógio + ícones + X) com o navy do cabeçalho e
      // redesenhamos o título. «visão hóspede» (y64+) fica intacto.
      { t: 'rect', x: 8, y: 6, w: 456, h: 54, fill: '#003176' },
      {
        t: 'text',
        x: 48,
        y: 52,
        text: 'Anfitri-IA',
        size: 21,
        weight: 700,
        fill: '#ffffff',
      },
      { t: 'rect', x: 16, y: 110, w: 420, h: 210, fill: '#ffffff', rx: 12 },
      {
        t: 'text',
        x: 32,
        y: 148,
        text: 'Olá! Sou a Anfitri-IA. Posso informar',
        size: 13,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 168,
        text: 'sobre o imóvel e a sua estadia com',
        size: 13,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 188,
        text: 'base no guia. Em que posso ajudar',
        size: 13,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 208,
        text: `no ${DEMO.listingA}?`,
        size: 13,
        weight: 700,
        fill: '#1a1d2e',
      },
      { t: 'rect', x: 16, y: 410, w: 420, h: 260, fill: '#ffffff', rx: 12 },
      {
        t: 'text',
        x: 32,
        y: 458,
        text: `Olá! A senha do Wi-Fi do`,
        size: 13,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 478,
        text: `${DEMO.listingAVaga} é:`,
        size: 13,
        weight: 700,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 508,
        text: `1. Rede: ${DEMO.wifiSsid}`,
        size: 13,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 528,
        text: `2. Senha: ${DEMO.wifiPass}`,
        size: 13,
        fill: '#1a1d2e',
      },
    ],
  },
  {
    time: '12.07.32',
    slug: 'anfitri-ia-anfitriao',
    overlays: [
      // Relógio (12:07) e ícones de sinal/bateria da barra do iPhone,
      // cobertos com o cinza exato do topo (#f1f2f7).
      { t: 'rect', x: 36, y: 14, w: 90, h: 30, fill: '#f1f2f7' },
      { t: 'rect', x: 336, y: 14, w: 122, h: 30, fill: '#f1f2f7' },
      { t: 'rect', x: 14, y: 300, w: 444, h: 200, fill: '#dcfce7', rx: 12 },
      {
        t: 'text',
        x: 32,
        y: 368,
        text: 'Mostre o histórico completo da conversa',
        size: 12,
        fill: '#14532d',
      },
      {
        t: 'text',
        x: 32,
        y: 388,
        text: 'do hóspede com a Anfitri-IA no portal',
        size: 12,
        fill: '#14532d',
      },
      {
        t: 'text',
        x: 32,
        y: 408,
        text: 'da reserva HMDEMO0009. Use apenas',
        size: 12,
        fill: '#14532d',
      },
      {
        t: 'text',
        x: 32,
        y: 428,
        text: 'mensagens do portal.',
        size: 12,
        fill: '#14532d',
      },
      { t: 'rect', x: 14, y: 500, w: 444, h: 310, fill: '#ffffff', rx: 12 },
      {
        t: 'text',
        x: 32,
        y: 536,
        text: 'Histórico Anfitri-IA no portal (HMDEMO0009)',
        size: 12,
        weight: 700,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 556,
        text: `hóspede Marina Costa — ${DEMO.listingA}`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 586,
        text: '1) Hóspede: Ola, qual a senha do wifi ?',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 614,
        text: `2) Anfitri-IA: senha do Wi-Fi do`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 634,
        text: `${DEMO.listingAVaga}:`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 32,
        y: 654,
        text: `Rede ${DEMO.wifiSsid} · Senha ${DEMO.wifiPass}`,
        size: 12,
        fill: '#1a1d2e',
      },
    ],
  },
  {
    time: '14.17.33',
    slug: 'condominio-envio',
    overlays: [
      // Barra do iPhone (relógio 14:17 + sinal/bateria) sobre o fundo escurecido.
      { t: 'rect', x: 0, y: 0, w: 591, h: 64, fill: '#5e5e5e' },
      { t: 'rect', x: 20, y: 148, w: 452, h: 44, fill: '#ffffff' },
      {
        t: 'text',
        x: 50,
        y: 178,
        text: 'Código Airbnb: HMDEMO0005',
        size: 13,
        fill: '#64748b',
      },
      // Cartão titular (navy) — cobre nome, CPF, telefone, placa
      { t: 'rect', x: 50, y: 334, w: 492, h: 276, fill: '#11162c', rx: 12 },
      {
        t: 'text',
        x: 72,
        y: 364,
        text: 'Hóspede principal · Titular',
        size: 13,
        fill: '#dbe7f5',
        weight: 700,
      },
      {
        t: 'text',
        x: 72,
        y: 394,
        text: 'Enviado ao condomínio',
        size: 11,
        fill: '#9cc4e8',
      },
      {
        t: 'text',
        x: 72,
        y: 428,
        text: 'Nome    Marina Costa',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 456,
        text: 'Tipo    Adulto',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 484,
        text: 'Doc     CPF 000.000.000-00',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 512,
        text: 'E-mail / tel.    — · (41) 90000-0000',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 540,
        text: 'Veículo    ABC1D23',
        size: 13,
        fill: '#f4f6fb',
      },
      // Cartão acompanhante
      { t: 'rect', x: 50, y: 620, w: 492, h: 300, fill: '#11162c', rx: 12 },
      {
        t: 'text',
        x: 72,
        y: 650,
        text: 'Acompanhante 1',
        size: 13,
        fill: '#dbe7f5',
        weight: 700,
      },
      {
        t: 'text',
        x: 72,
        y: 680,
        text: 'Enviado ao condomínio',
        size: 11,
        fill: '#9cc4e8',
      },
      {
        t: 'text',
        x: 72,
        y: 714,
        text: 'Nome    Lucas Pereira',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 742,
        text: 'Tipo    Adulto',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 770,
        text: 'Doc     Passaporte AA0000000',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 798,
        text: 'Emissor    Brasil',
        size: 13,
        fill: '#f4f6fb',
      },
      {
        t: 'text',
        x: 72,
        y: 826,
        text: 'E-mail / tel.    — · —',
        size: 13,
        fill: '#f4f6fb',
      },
    ],
  },
  {
    time: '14.35.54',
    slug: 'anfitri-ia',
    overlays: [
      { t: 'rect', x: 16, y: 244, w: 410, h: 226, fill: '#fffefd', rx: 12 },
      {
        t: 'text',
        x: 24,
        y: 258,
        text: 'Para esta semana, as reservas são:',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 280,
        text: `• ${DEMO.aptRecanto}, bloco 08, apto 302: hóspede`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 36,
        y: 298,
        text: 'Marina Costa, check-in na segunda-feira.',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 320,
        text: `• ${DEMO.aptBosque}, bloco 12, apto 204: hóspede`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 36,
        y: 338,
        text: 'Pedro Almeida, check-out na terça-feira.',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 360,
        text: `• ${DEMO.aptRecanto}, bloco 08, apto 302: hóspede`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 36,
        y: 378,
        text: 'Marina Costa, check-out na sexta-feira.',
        size: 12,
        fill: '#1a1d2e',
      },
      { t: 'rect', x: 16, y: 544, w: 410, h: 168, fill: '#fffefd', rx: 12 },
      {
        t: 'text',
        x: 24,
        y: 560,
        text: `Para a reserva de Marina Costa no ${DEMO.aptRecanto},`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 578,
        text: 'o portal ainda não foi preenchido.',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 606,
        text: `Para a reserva de Pedro Almeida no ${DEMO.aptBosque},`,
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 624,
        text: 'o portal está preenchido. A conversa',
        size: 12,
        fill: '#1a1d2e',
      },
      {
        t: 'text',
        x: 24,
        y: 642,
        text: 'fica no histórico da reserva.',
        size: 12,
        fill: '#1a1d2e',
      },
    ],
  },
  {
    time: '14.18.07',
    slug: 'financeiro-painel',
    overlays: [
      // Barra do iPhone (relógio 14:17 + sinal/bateria), fundo claro real.
      { t: 'rect', x: 0, y: 0, w: 591, h: 62, fill: '#f9f9f9' },
    ],
  },
  {
    time: '14.19.40',
    slug: 'limpeza-os',
    overlays: [
      // Barra do iPhone (relógio 14:19 + sinal/bateria), fundo real #f1f2f7.
      { t: 'rect', x: 0, y: 0, w: 591, h: 62, fill: '#f1f2f7' },
      // Nome do imóvel (y550-566), fundo plano #fbfbfb.
      { t: 'rect', x: 90, y: 546, w: 400, h: 26, fill: '#fbfbfb' },
      {
        t: 'text',
        x: 96,
        y: 564,
        text: DEMO.listingLong,
        size: 14,
        weight: 700,
        fill: '#1a1d2e',
      },
      // Endereço real (linhas y580-592, 610-626, 640-652, 664-676) substituído
      // por 2 linhas fictícias nas mesmas posições; fundo plano invisível.
      { t: 'rect', x: 90, y: 574, w: 460, h: 112, fill: '#fbfbfb' },
      {
        t: 'text',
        x: 96,
        y: 592,
        text: DEMO.street,
        size: 12,
        fill: '#4b5563',
      },
      {
        t: 'text',
        x: 96,
        y: 624,
        text: DEMO.streetFull2,
        size: 12,
        fill: '#4b5563',
      },
      { t: 'rect', x: 90, y: 688, w: 440, h: 30, fill: '#fbfbfb' },
      {
        t: 'text',
        x: 96,
        y: 710,
        text: 'Reserva Airbnb: HMDEMO0008',
        size: 13,
        fill: '#1a1d2e',
      },
    ],
  },
  {
    time: '14.39.14',
    slug: 'limpeza-fotos',
    overlays: [], // sem PII — só converter
  },
  {
    time: '14.55.22',
    slug: 'integracoes',
    overlays: [
      { t: 'rect', x: 38, y: 538, w: 280, h: 26, fill: '#ffffff' },
    {
      t: 'text',
      x: 48,
      y: 556,
      text: 'Reserva confirmada — demonstração',
      size: 11,
      fill: '#475569',
    },
  ],
},
{
  file: 'anfitri-ia-historico.png',
  slug: 'anfitri-ia-historico',
  overlays: [
    // «Olá, Gabriel!» — só o nome; o cumprimento fica.
    { t: 'rect', x: 348, y: 406, w: 72, h: 18, fill: '#ffffff' },
    {
      t: 'text',
      x: 350,
      y: 420,
      text: 'Marina!',
      size: 13,
      fill: '#1a1d2e',
    },
    // «Seu cadastro no condomínio está concluído.» — não anunciar portaria.
    { t: 'rect', x: 34, y: 586, w: 320, h: 22, fill: '#ffffff' },
    {
      t: 'text',
      x: 36,
      y: 602,
      text: 'Seu cadastro está concluído.',
      size: 13,
      fill: '#1a1d2e',
    },
    // «Aconchego» no fim da linha do check-in.
    { t: 'rect', x: 34, y: 608, w: 300, h: 22, fill: '#ffffff' },
    {
      t: 'text',
      x: 36,
      y: 624,
      text: 'O horário de check-in para sua estadia no Recanto',
      size: 13,
      fill: '#1a1d2e',
    },
    // «Aeroporto com garagem!» na linha seguinte.
    { t: 'rect', x: 34, y: 632, w: 380, h: 22, fill: '#ffffff' },
    {
      t: 'text',
      x: 36,
      y: 648,
      text: 'do Terminal! É às 17:00 de sábado, 5 de',
      size: 13,
      fill: '#1a1d2e',
    },
  ],
},
{
  // Central de Notificações do iPhone (591×1280). Cartões translúcidos: blur + texto branco.
  file: 'Mensagens_hostlogic.jpeg',
  slug: 'avisos-push',
  overlays: [
    // Cartão 1 — código interno da reserva.
    { t: 'blur', x: 108, y: 562, w: 270, h: 38, sigma: 18 },
    { t: 'text', x: 114, y: 589, text: 'Cód. RES-0A1B2C3D', size: 23, fill: '#f5f5f7' },
    // Cartão 2 — nome real do anúncio (2 linhas).
    { t: 'blur', x: 108, y: 702, w: 420, h: 38, sigma: 18 },
    { t: 'text', x: 114, y: 729, text: '2/2 hóspedes — Recanto do', size: 23, fill: '#f5f5f7' },
    { t: 'blur', x: 108, y: 736, w: 420, h: 38, sigma: 18 },
    { t: 'text', x: 114, y: 762, text: 'Terminal com vaga', size: 23, fill: '#f5f5f7' },
    // Cartão 3 — nome do anúncio + código Airbnb (datas ficam).
    { t: 'blur', x: 108, y: 876, w: 430, h: 38, sigma: 18 },
    { t: 'text', x: 114, y: 903, text: 'Recanto do Terminal com', size: 23, fill: '#f5f5f7' },
    { t: 'blur', x: 108, y: 908, w: 430, h: 38, sigma: 18 },
    { t: 'text', x: 114, y: 934, text: 'vaga · Cód. HMDEMO2026 ·', size: 23, fill: '#f5f5f7' },
    // Cartão 4 (parcialmente tapado) — nome real do anúncio.
    { t: 'blur', x: 118, y: 988, w: 420, h: 38, sigma: 18 },
    { t: 'text', x: 124, y: 1015, text: '4/4 hóspedes — Recanto do', size: 23, fill: '#f5f5f7' },
    { t: 'blur', x: 118, y: 1020, w: 420, h: 38, sigma: 18 },
    { t: 'text', x: 124, y: 1047, text: 'Terminal com vaga', size: 23, fill: '#f5f5f7' },
  ],
},
];

function parseSrcDir(argv) {
  const flag = argv.indexOf('--src');
  if (flag >= 0 && argv[flag + 1]) return argv[flag + 1];
  if (process.env.PRINTS_DIR) return process.env.PRINTS_DIR;
  return DEFAULT_SRC;
}

function assertSrcOutsideRepo(srcDir) {
  const resolved = path.resolve(srcDir);
  const root = repoRoot.endsWith(path.sep) ? repoRoot : repoRoot + path.sep;
  if (resolved === repoRoot || resolved.startsWith(root)) {
    throw new Error(
      `Originais recusados: ${resolved} está dentro do repo. Passe --src ou PRINTS_DIR para um diretório externo.`,
    );
  }
}

function findOriginal(srcDir, job) {
  if (job.file) {
    const p = path.join(srcDir, job.file);
    if (!fs.existsSync(p)) {
      throw new Error(`Original não encontrado: ${p}`);
    }
    return p;
  }
  const files = fs.readdirSync(srcDir);
  const needle = `at ${job.time}.`;
  const hit = files.find((f) => f.includes(needle) && /\.(jpe?g|png)$/i.test(f));
  if (!hit) {
    throw new Error(`Original não encontrado para ${job.time} em ${srcDir}`);
  }
  return path.join(srcDir, hit);
}

function escXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {number} w @param {number} h @param {OverlayOp[]} ops */
function overlaySvg(w, h, ops) {
  const body = ops
    .filter((op) => op.t !== 'image' && op.t !== 'blur')
    .map((op) => {
      if (op.t === 'rect') {
        const rx = op.rx ? ` rx="${op.rx}" ry="${op.rx}"` : '';
        return `<rect x="${op.x}" y="${op.y}" width="${op.w}" height="${op.h}"${rx} fill="${op.fill}"/>`;
      }
      const anchor = op.anchor ? ` text-anchor="${op.anchor}"` : '';
      const weight = op.weight ? ` font-weight="${op.weight}"` : '';
      const fill = op.fill || '#1a1d2e';
      return `<text x="${op.x}" y="${op.y}" font-family="${FONT}" font-size="${op.size}" fill="${fill}"${anchor}${weight}>${escXml(op.text)}</text>`;
    })
    .join('');
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`,
  );
}

async function imageLayers(ops) {
  const layers = [];
  for (const op of ops) {
    if (op.t !== 'image') continue;
    const src = path.join(__dirname, 'assets', op.src);
    if (!fs.existsSync(src)) {
      throw new Error(`Imagem de overlay em falta: ${src}`);
    }
    const buf = await sharp(src)
      .resize(op.w, op.h, { fit: 'cover' })
      .composite(
        op.rx
          ? [
              {
                input: Buffer.from(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="${op.w}" height="${op.h}"><rect x="0" y="0" width="${op.w}" height="${op.h}" rx="${op.rx}" ry="${op.rx}" fill="#fff"/></svg>`,
                ),
                blend: 'dest-in',
              },
            ]
          : [],
      )
      .png()
      .toBuffer();
    layers.push({ input: buf, left: op.x, top: op.y });
  }
  return layers;
}

async function blurLayers(input, ops) {
  const layers = [];
  for (const op of ops) {
    if (op.t !== 'blur') continue;
    const buf = await sharp(input)
      .extract({ left: op.x, top: op.y, width: op.w, height: op.h })
      .blur(op.sigma ?? 8)
      .png()
      .toBuffer();
    layers.push({ input: buf, left: op.x, top: op.y });
  }
  return layers;
}

async function sampleFill(input, op) {
  const { data, info } = await sharp(input)
    .extract({ left: op.x, top: op.y, width: op.w, height: op.h })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let rS = 0, gS = 0, bS = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 140) continue; // ignora texto/ícone/borda
    rS += r; gS += g; bS += b; n += 1;
  }
  if (!n) return '#ffffff';
  return `#${[rS / n, gS / n, bS / n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

async function resolveOverlays(input, ops) {
  const out = [];
  for (const op of ops) {
    if (op.t === 'rect' && op.fill === 'auto') {
      out.push({ ...op, fill: await sampleFill(input, op) });
    } else {
      out.push(op);
    }
  }
  return out;
}

async function processJob(srcDir, job) {
  const input = findOriginal(srcDir, job);
  const meta = await sharp(input).metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (!width || !height) {
    throw new Error(`Sem dimensões: ${input}`);
  }

  const overlays = await resolveOverlays(input, job.overlays);
  // Ordem: blur do original primeiro, depois rect/text (SVG), depois imagens.
  const composites = await blurLayers(input, overlays);
  const drawOps = overlays.filter((op) => op.t !== 'image' && op.t !== 'blur');
  if (drawOps.length) {
    const overlayPng = await sharp(overlaySvg(width, height, drawOps), {
      density: 72,
    })
      .png()
      .toBuffer();
    composites.push({ input: overlayPng, top: 0, left: 0 });
  }
  composites.push(...(await imageLayers(overlays)));

  let pipeline = sharp(input);
  if (composites.length) {
    pipeline = pipeline.composite(composites);
  }

  const dest = path.join(outDir, `${job.slug}.webp`);
  await pipeline
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(dest);

  const bytes = fs.statSync(dest).size;
  console.log(
    `${job.slug}.webp  ${(bytes / 1024).toFixed(1)} KB  from ${path.basename(input)}`,
  );
  return { dest, bytes };
}

function parseOnly(argv) {
  const flag = argv.indexOf('--only');
  if (flag >= 0 && argv[flag + 1]) {
    return argv[flag + 1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

async function main() {
  const argv = process.argv.slice(2);
  const srcDir = parseSrcDir(argv);
  const only = parseOnly(argv);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Diretório de originais inexistente: ${srcDir}`);
  }
  assertSrcOutsideRepo(srcDir);
  fs.mkdirSync(outDir, { recursive: true });

  const jobs = only ? JOBS.filter((j) => only.includes(j.slug)) : JOBS;
  if (!jobs.length) {
    throw new Error(`Nenhum job corresponde a --only ${only.join(',')}`);
  }

  const results = [];
  for (const job of jobs) {
    results.push(await processJob(srcDir, job));
  }

  const over = results.filter((r) => r.bytes > 120 * 1024);
  if (over.length) {
    console.warn(
      `Aviso: ${over.length} ficheiro(s) acima de 120 KB: ${over.map((r) => path.basename(r.dest)).join(', ')}`,
    );
  }
  console.log(`OK: ${results.length} WebP em ${path.relative(repoRoot, outDir) || 'public/screenshots'}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
