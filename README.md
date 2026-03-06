# PISAC - Centro de Comando de Resiliência Municipal

Plataforma Integrada de Situação, Alerta e Comando para gestão de resiliência urbana no Distrito Federal. Desenvolvido na Universidade de Brasília (UnB).

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5 |
| Estilização | Tailwind CSS 3, CSS Variables (dark/light theme) |
| State Management | Zustand |
| Banco de Dados | Google Firebase (Firestore) |
| Mapas | Leaflet, React-Leaflet |
| 3D/BIM | Three.js |
| Gráficos | Recharts |
| Exportação | jsPDF + autoTable, xlsx |
| Testes | Vitest, Testing Library |
| Deploy | Vercel (região GRU1 - São Paulo) |
| Ícones | Lucide React |

## Módulos

1. **Painel de Controle** - Dashboard com métricas em tempo real
2. **Mapa BIM/GIS/IoT** - Visualização geoespacial com camadas GIS e modelos BIM 3D
3. **Análise de Dados** - Correlação, root cause analysis, tendências
4. **Simulação de Cenários** - Modelagem hidrológica, Monte Carlo, what-if
5. **Monitoramento em Tempo Real** - Sensores IoT, CEMADEN, INMET
6. **Gestão Orçamentária** - Orçamento participativo, execução, convênios
7. **Gestão de Crises** - Comunicação segura (CAP), workflows de incidentes, coordenação intermunicipal
8. **Análise Orçamentária** - Custo-benefício, ROI, planejamento de investimentos
9. **Governança e Conformidade** - RBAC, LGPD, auditoria 5W, Gov.br, ICP-Brasil, e-PING

## Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Firebase

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Testes
npm run test
```

## APIs Governamentais Integradas

| API | Descrição | Endpoint |
|-----|-----------|----------|
| CEMADEN | Alertas hidrológicos e pluviométricos | `/api/integrations/cemaden` |
| INMET | Previsão do tempo e avisos meteorológicos | `/api/integrations/inmet` |

## API Routes

| Rota | Métodos | Descrição |
|------|---------|-----------|
| `/api/sensors` | GET, POST | Sensores IoT |
| `/api/alerts` | GET, POST | Alertas do sistema |
| `/api/crises` | GET, POST, PATCH | Gestão de crises |
| `/api/incidents` | GET, POST, PATCH | Incidentes |
| `/api/municipalities` | GET | Municípios |
| `/api/resources` | GET, POST, PATCH | Recursos de crise |
| `/api/export` | GET | Exportação PDF/Excel |

Todas as rotas suportam **dual-mode**: Firestore quando configurado, fallback para dados mock quando não.

## Configuração Firebase

1. Criar projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Copiar credenciais para `.env.local`
4. (Opcional) Executar seed: `npx ts-node src/lib/firebase/seed.ts`

## Deploy Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

A configuração em `vercel.json` define:
- Região: **GRU1** (São Paulo - menor latência para Brasil)
- Headers de segurança (HSTS, X-Frame-Options, CSP)
- Build otimizado para Next.js

## Conformidade GovTech

- **LGPD** (Lei 13.709/2018) - Módulo completo de conformidade
- **e-PING** - APIs em conformidade com padrões de interoperabilidade
- **e-MAG** - Acessibilidade para governo eletrônico
- **Gov.br** - Preparado para autenticação Login Único (OpenID Connect)
- **ICP-Brasil** - Preparado para assinatura digital (certificados A1/A3)
- **TCU** - Logs de auditoria com retenção de 5-20 anos

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (REST)
│   │   ├── sensors/       # IoT sensors
│   │   ├── alerts/        # System alerts
│   │   ├── crises/        # Crisis management
│   │   ├── incidents/     # Incident tracking
│   │   ├── municipalities/# Municipality data
│   │   ├── resources/     # Resource coordination
│   │   ├── export/        # PDF/Excel export
│   │   └── integrations/  # CEMADEN, INMET
│   ├── page.tsx           # Main SPA entry
│   └── layout.tsx         # Root layout
├── components/            # React components (33 files)
│   ├── crisis/            # Crisis management module
│   ├── governance/        # Governance module
│   ├── maps/              # GIS/BIM module
│   └── ...                # Other modules
├── data/                  # Mock data (3,555 lines)
├── lib/                   # Business logic
│   ├── firebase/          # Firestore config & collections
│   ├── export.ts          # PDF/Excel generation
│   ├── simulation-engine.ts
│   ├── analysis-engine.ts
│   └── realtime-service.ts
├── stores/                # Zustand state management
├── types/                 # TypeScript type definitions
└── __tests__/             # Test suites
```

## Licença

Projeto acadêmico - Universidade de Brasília (UnB).
