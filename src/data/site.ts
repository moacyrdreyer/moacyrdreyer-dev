/**
 * All page content lives here. Edit texts, links and projects without touching components.
 * Empty strings hide optional items (e.g. linkedin, whatsapp).
 */

export const site = {
  name: 'Moacyr Dreyer',
  role: 'Desenvolvedor Full Stack',
  email: 'moadreyer01@gmail.com',
  githubUser: 'moacyrdreyer',
  available: true,
  links: {
    github: 'https://github.com/moacyrdreyer',
    instagram: 'https://www.instagram.com/moacyr_dreyer',
    linkedin: '', // ex.: https://www.linkedin.com/in/seu-usuario
    whatsapp: '', // ex.: 5585999999999
  },

  nav: [
    { label: 'Serviços', href: '#servicos' },
    { label: 'Projetos', href: '#projetos' },
    { label: 'Código', href: '#codigo' },
    { label: 'Stack', href: '#stack' },
    { label: 'Processo', href: '#processo' },
  ],

  hero: {
    status: 'Disponível para novos projetos',
    title: 'Do banco de dados',
    titleAccent: 'ao pixel.',
    lead: 'Sou Moacyr Dreyer, desenvolvedor full stack. Construo produtos web completos — interfaces rápidas, APIs robustas e integrações que funcionam — com React, Node.js e TypeScript.',
    primary: { label: 'Iniciar projeto', href: '#contato' },
    secondary: { label: 'Ver trabalhos', href: '#projetos' },
  },

  showcase: {
    label: '00 — Vitrine',
    title: 'Do commit ao ar.',
    text: 'Front-end, back-end e deploy na mesma pessoa. Menos repasses, mais entrega.',
    file: 'api/projects.ts',
    terminal: [
      { kind: 'cmd', text: 'npm run test' },
      { kind: 'ok', text: '42 testes passaram', note: '(1.8s)' },
      { kind: 'cmd', text: 'vercel deploy --prod' },
      { kind: 'info', text: '› Build iniciado…' },
      { kind: 'ok', text: 'Build concluído em 18s' },
      { kind: 'ok', text: 'Produção:', strong: 'moacyrdreyer.dev' },
    ],
  },

  services: {
    label: '01 — Serviços',
    title: 'Software sob medida, do esboço ao deploy.',
    text: 'Para empresas que precisam de um produto no ar e para times que precisam de mais uma pessoa que entrega.',
    items: [
      { title: 'Front-end', text: 'Interfaces rápidas, acessíveis e com atenção a cada detalhe de interação.', tags: ['React', 'TypeScript', 'Motion'] },
      { title: 'Back-end & APIs', text: 'APIs REST bem tipadas, modelagem de dados e regras de negócio testadas.', tags: ['Node.js', 'PostgreSQL', 'REST'] },
      { title: 'Integrações & automação', text: 'Conecto sistemas de cobrança, ERPs e webhooks para eliminar trabalho manual.', tags: ['Webhooks', 'Jobs', 'APIs externas'] },
      { title: 'Landing pages & produto', text: 'Páginas que convertem, com performance alta e deploy contínuo.', tags: ['Vite', 'Vercel', 'SEO'] },
    ],
  },

  projects: {
    label: '02 — Projetos',
    title: 'Trabalho em produção.',
    text: 'Projetos reais com clientes reais. Os detalhes técnicos ficam em cada estudo de caso.',
    items: [
      {
        name: 'Limiar',
        category: 'Site institucional · 2026',
        text: 'Presença digital da Limiar Consultoria Esportiva: site rápido, responsivo e pronto para captar alunos.',
        tags: ['React', 'Vite', 'Vercel'],
        url: 'https://www.soulimiar.com.br/',
        urlLabel: 'soulimiar.com.br',
        mock: 'site' as const,
      },
      {
        name: 'Limiar Finance',
        category: 'Painel financeiro · em andamento',
        text: 'Painel financeiro com integrações de cobrança: sincroniza dados via API e webhooks e mostra a saúde do negócio em tempo real.',
        tags: ['TypeScript', 'Node.js', 'Webhooks'],
        url: '',
        urlLabel: 'limiar-finance · painel',
        mock: 'dashboard' as const,
      },
    ],
  },

  openSource: {
    label: '03 — Código aberto',
    title: 'Código aberto, direto do GitHub.',
    text: 'Estudos, ferramentas e projetos públicos. Tudo versionado e aberto para você explorar.',
    cta: 'Ver repositórios',
    url: 'https://github.com/moacyrdreyer?tab=repositories',
  },

  stack: {
    label: '04 — Stack',
    title: 'Ferramentas que uso todo dia.',
    rowA: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Vite', 'Next.js'],
    rowB: ['Git', 'Vercel', 'REST', 'Webhooks', 'Vitest', 'Motion'],
    groups: [
      { title: 'Front-end', items: 'React, TypeScript, Vite, Next.js, CSS, Motion' },
      { title: 'Back-end', items: 'Node.js, Express, APIs REST, autenticação' },
      { title: 'Dados', items: 'PostgreSQL, modelagem, migrações' },
      { title: 'Infra & ferramentas', items: 'Git, GitHub, Vercel, Vitest, CI' },
    ],
  },

  process: {
    label: '05 — Processo',
    title: 'Como um projeto anda.',
    text: 'Etapas curtas, entregas visíveis e nenhuma surpresa no fim. Você acompanha tudo em um link de preview desde a primeira semana.',
    steps: [
      { title: 'Descoberta', text: 'Entender o problema, o público e o que é sucesso.' },
      { title: 'Arquitetura', text: 'Dados, integrações e stack definidos antes do código.' },
      { title: 'Construção', text: 'Entregas semanais em ambiente de preview.' },
      { title: 'Refino', text: 'Testes, performance e acessibilidade.' },
      { title: 'Entrega', text: 'Deploy, documentação e suporte pós-lançamento.' },
    ],
  },

  contact: {
    label: '06 — Contato',
    title: 'Vamos construir',
    titleAccent: 'algo juntos?',
  },

  credit: {
    model: 'macbook pro M3 16 inch 2024',
    author: 'jackbaeten',
    authorUrl: 'https://sketchfab.com/jackbaeten',
    modelUrl: 'https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
}

/** Code typed on the laptop screen and in the showcase editor: [text, token class]. */
export const codeTokens: [string, string][] = [
  ['// api/projects.ts — lista projetos publicados\n', 't-c'],
  ['import', 't-k'], [' { db } ', 't-p'], ['from', 't-k'], [" '@/lib/db'\n\n", 't-s'],
  ['export async function', 't-k'], [' GET', 't-f'], ['() {\n', 't-p'],
  ['  const', 't-k'], [' projects = ', ''], ['await', 't-k'], [' db.project.', ''], ['findMany', 't-f'], ['({\n', 't-p'],
  ['    where', ''], [': { status: ', 't-p'], ["'published'", 't-s'], [' },\n', 't-p'],
  ['    orderBy', ''], [': { updatedAt: ', 't-p'], ["'desc'", 't-s'], [' },\n', 't-p'],
  ['  })\n\n', 't-p'],
  ['  return', 't-k'], [' Response.', ''], ['json', 't-f'], ['(projects)\n', 't-p'],
  ['}', 't-p'],
]
