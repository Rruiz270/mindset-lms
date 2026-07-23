# Mindset LMS

Learning Management System de idiomas (inglês/espanhol) do Mindset Institute, com sistema de entrada aberta, níveis CEFR (Starter/Survivor/Explorer/Expert), aulas ao vivo, exercícios pré/pós-aula, agendamento com professores e dashboards por papel (aluno, professor, admin).

> ATENÇÃO: este é Next.js 16 com App Router. As APIs, convenções e estrutura podem divergir do seu conhecimento prévio. Leia os guias em `node_modules/next/dist/docs/` antes de escrever código e observe avisos de depreciação.

## Stack
- **Linguagem**: TypeScript 5 (strict), React 19.1.
- **Framework**: Next.js 16.2 (App Router, `src/app/`).
- **ORM/Banco**: Prisma 6 + PostgreSQL (`prisma/schema.prisma`, datasource via `DATABASE_URL`).
- **Auth**: NextAuth 4 (`next-auth`) com `@auth/prisma-adapter`; senhas com `bcryptjs`.
- **UI**: Tailwind CSS 3 + Radix UI + `lucide-react`; formulários com `react-hook-form` + `zod`.
- **IA**: `@anthropic-ai/sdk` (Claude) e `openai` (geração de conteúdo/exercícios).
- **Integrações**: Google Calendar/Meet (`src/lib/google-*`).
- **Deploy**: Vercel (`vercel.json`, região `cle1`).
- **Package manager**: npm (há `package-lock.json`). `.npmrc` define `legacy-peer-deps=true` — mantenha ao instalar.

## Comandos
- `npm run dev` — servidor de desenvolvimento (http://localhost:3000).
- `npm run build` — roda `prisma generate` e depois `next build`.
- `npm start` — servidor de produção.
- `npm run lint` — ESLint (config em `eslint.config.mjs`, flat config `next/core-web-vitals` + `next/typescript`).
- `npm run db:generate` — gera o Prisma Client.
- `npm run db:push` — aplica o schema no banco (sem migrations versionadas).
- `npm run db:seed` — popula dados (`prisma/seed.ts`); há variantes `db:seed-starter`, `db:seed-topics`, `seed:content`, `seed:starter`.
- `npm run db:setup` — `db push` + `generate`.
- Não há suíte de testes configurada.

## Estrutura
- `src/app/` — App Router: rotas por papel (`admin/`, `teacher/`, `student/`, `dashboard/`, `live-class/`, `auth/`) e API em `src/app/api/` (`admin`, `bookings`, `exercises`, `topics`, `teacher`, `student`, `user`, `health`, `auth`).
- `src/components/` — componentes de UI.
- `src/lib/` — `prisma.ts` (client singleton), `auth.ts` (NextAuth), `google-calendar.ts`/`google-auth-helper.ts` (integração Google), `content-sync.ts`, `utils.ts`.
- `src/data/`, `src/i18n/`, `src/types/` — dados estáticos, internacionalização e tipos.
- `prisma/` — `schema.prisma`, seeds e SQLs auxiliares (`create-tables.sql`, `add-content-model.sql`). `dev.db` presente mas o provider é PostgreSQL.
- `scripts/` — scripts `tsx` de manutenção (`seed-content.ts`, `seed-topics.ts`, `fix-missing-slides.ts`).
- Na raiz há `students-data.js`, `students_data.js`, `student-data-converter.js` — dumps/conversores de dados de alunos (contêm PII; ver Segurança).
- Docs: `README.md`, `DEPLOYMENT.md`, `VERCEL_SETUP.md`, `docs/`.

## Convenções de código
- TypeScript `strict: true`. Alias de import `@/*` → `src/*`.
- ATENÇÃO: `next.config.ts` tem `typescript.ignoreBuildErrors: true` — o build NÃO falha em erro de tipo. Rode `npx tsc --noEmit` localmente para pegar regressões de tipo antes do PR.
- Modelos Prisma em PascalCase; enums `UserRole`, `Level`, `BookingStatus`. Use o client singleton de `src/lib/prisma.ts` (não instancie `PrismaClient` avulso).
- Rotas de API no padrão App Router (`route.ts` com handlers nomeados). Componentes server-only marcam `server-only`.

## Variáveis de ambiente
Defina em `.env.local` (dev) e no painel da Vercel (prod). NUNCA commite valores.
- `DATABASE_URL` — string PostgreSQL.
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — NextAuth.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth/Calendar/Meet.
- `ANTHROPIC_API_KEY` — Claude (geração de conteúdo).
- (`openai` está nas deps; se usado, configure a chave correspondente antes.)

## CI/CD & Deploy
- Deploy automático na Vercel a partir da `main` (`vercel.json`: framework `nextjs`, região `cle1`). `postinstall` roda `prisma generate`.
- Não há workflows de CI (`.github/workflows/` ausente). **Recomendado** adicionar via PR um workflow mínimo: `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build`. O typecheck explícito é importante porque o build ignora erros de tipo.

## Boas práticas de PR
- Branches: `feat/…`, `fix/…`, `chore/…`. Commits no padrão Conventional Commits (como no histórico: `fix: …`).
- PRs pequenos e focados. Checklist: `npm run build` passa; `npx tsc --noEmit` limpo; `npm run lint` sem erros; sem segredos no diff; mudanças de schema Prisma acompanhadas de plano de `db push`/rollback; screenshots para mudanças de UI.
- Ao menos 1 review; squash merge; `main` sempre deployável.

## Testes
- Sem testes hoje. Recomendação proporcional: cobrir `src/lib/` (auth, agendamento/bookings, scoring de exercícios) com Vitest antes de evoluir a lógica de negócio.

## Segurança & dados
- Dados pessoais de alunos (LGPD): trate `students-data.js`/`students_data.js` e as tabelas de `User` como dados sensíveis. Não exponha em logs, não gere novos dumps com PII no repositório e considere removê-los do versionamento.
- Nunca commite `.env*` (já no `.gitignore`). Senhas sempre com `bcryptjs`.
- Revise dependências de IA e auth ao atualizar; `legacy-peer-deps` mascara conflitos de peers — audite após bumps.

## Gotchas
- `typescript.ignoreBuildErrors: true` esconde erros de tipo no build — sempre rode `tsc --noEmit`.
- `db push` (não `migrate`) — não há migrations versionadas; alinhe mudanças de schema com o estado real do banco em produção antes de aplicar.
- `.npmrc` com `legacy-peer-deps=true` é necessário para instalar (peers conflitantes); não remova sem revalidar o `install`.
- Há dois arquivos de dados de alunos parecidos (`students-data.js` e `students_data.js`) — confirme qual é a fonte de verdade antes de mexer.
