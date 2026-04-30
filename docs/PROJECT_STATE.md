# PROJECT_STATE.md

Estado operacional vivo do projeto. Este arquivo substitui o uso antigo de `docs/HANDOFF.md` como memória dinâmica. Deve permanecer técnico, sintético e acionável, sem virar diário de conversa.

Última atualização: 2026-04-30.

## Objetivo do Projeto

Aplicação web local e didática para apoiar o curso **Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte**, no contexto do Laboratório de Controle Ambiental (LCA).

A ferramenta permite trabalhar com dados laboratoriais em quatro frentes:

- estatística descritiva;
- curva normal e normalidade;
- carta de controle;
- relatório consolidado para impressão/PDF.

## Estado Atual

- Projeto em HTML5, CSS3 e JavaScript puro.
- Sem backend, banco de dados, `package.json`, processo de build ou suíte automatizada configurada.
- Uso previsto: abrir `index.html` diretamente no navegador.
- Gráficos dependem de Plotly.js por CDN.
- README identifica a versão atual como `v0.9.0-beta`, licença MIT e contato institucional `lca.limoeiro@ifce.edu.br`.
- Apoio de IA generativa é registrado de forma transparente na documentação, sem substituir revisão humana.
- Módulos salvam resultados no `localStorage` para o relatório consolidado.
- Arquitetura de contexto padronizada: `AGENTS.md` é o guia permanente, `docs/PROJECT_STATE.md` é a memória operacional contínua e `docs/HANDOFF.md` é apenas passagem de contexto.

## Estrutura Real do Repositório

```text
estatistica-controle-qualidade/
├── index.html
├── descritiva.html
├── normalidade.html
├── controle.html
├── relatorio.html
├── README.md
├── LICENSE
├── AGENTS.md
├── .gitignore
├── docs/
│   ├── PROJECT_STATE.md
│   └── HANDOFF.md
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── parser.js
        ├── exemplos.js
        ├── estatistica.js
        ├── graficos.js
        ├── descritiva.js
        ├── normalidade.js
        ├── controle.js
        └── relatorio.js
```

## Arquivos Principais

- `index.html`: entrada da aplicação e cards dos quatro módulos.
- `descritiva.html`: entrada de dados, exemplos, estatísticas, gráficos e relatório descritivo.
- `normalidade.html`: testes aproximados, histograma com curva normal, Q-Q plot, intervalos e probabilidade acumulada.
- `controle.html`: carta de controle de indivíduos, métodos de limite, tabela de pontos e relatório.
- `relatorio.html`: relatório consolidado baseado em dados salvos no navegador.
- `assets/css/style.css`: layout, responsividade, rodapé, gráficos e regras de impressão.
- `assets/js/parser.js`: leitura e conversão de dados, incluindo vírgula decimal.
- `assets/js/estatistica.js`: medidas descritivas, funções de normalidade e testes aproximados.
- `assets/js/graficos.js`: geração/exportação de gráficos Plotly.
- `assets/js/exemplos.js`: cinco exemplos didáticos compartilhados entre módulos.
- `assets/js/descritiva.js`: lógica da página descritiva.
- `assets/js/normalidade.js`: lógica da página de normalidade.
- `assets/js/controle.js`: cálculo de limites, alertas e relatório da carta.
- `assets/js/relatorio.js`: montagem do relatório consolidado e preparação para impressão.
- `README.md`: documentação humana de uso, limitações, módulos e arquitetura de contexto.
- `AGENTS.md`: regras permanentes para Codex, OpenCode e outros agentes.
- `docs/PROJECT_STATE.md`: estado operacional vivo.
- `docs/HANDOFF.md`: passagem de contexto para outro chat, agente ou sessão.

## Decisões em Vigor

- Manter aplicação local, sem backend obrigatório.
- Manter abertura direta por `index.html`.
- Usar Plotly.js por CDN, salvo decisão futura documentada para cópia local.
- Manter visual limpo, técnico e didático, com ajustes pontuais quando necessário.
- Usar português do Brasil na interface, relatórios e documentação.
- Manter exemplos fictícios, didáticos e plausíveis em `assets/js/exemplos.js`.
- Lembrar o último exemplo escolhido com `localStorage` em `cq_selected_example`.
- Não exibir Shapiro-Wilk como linha calculada sem algoritmo validado no navegador.
- Usar linguagem cautelosa para normalidade: p-valor não prova normalidade.
- Diferenciar limite estatístico de controle, limite operacional interno e limite legal/regulatório.
- Tratar sinais da carta de controle como indicação de investigação, não invalidação automática.
- Recriar gráficos do relatório consolidado a partir dos dados salvos, evitando guardar imagens pesadas no `localStorage`.
- Manter `AGENTS.md`, `docs/PROJECT_STATE.md` e `docs/HANDOFF.md` versionados.
- Seguir arquitetura suficiente: preferir a solução mais simples que resolva o problema real, evitar camadas e patterns sem justificativa explícita e abstrair apenas quando houver dor concreta.

## Limitações Conhecidas

- Não há suíte automatizada configurada.
- Não há validação formal para uso em rotina acreditada.
- Testes de normalidade e p-valores são aproximações didáticas.
- Shapiro-Wilk não é calculado nesta versão.
- Plotly.js depende de CDN; sem internet, gráficos podem falhar até que exista cópia local.
- Dados de análises ficam no `localStorage` do navegador e devem ser limpos em computador compartilhado.
- Impressão/PDF depende do navegador e ainda precisa ser conferida manualmente em ambiente real.

## Testes Feitos

- Em 2026-04-30, os cinco HTMLs foram abertos em Edge headless via CDP para conferir rodapé institucional, versão, contato, licença, aviso didático e menção ao apoio de IA generativa. Não foram encontrados erros JavaScript de console nessa verificação.
- Em 2026-04-30, a navegação superior foi padronizada para exibir sempre `Início`, `Descritiva`, `Normalidade`, `Controle` e `Relatório`, mantendo a página atual visível e destacada com `aria-current="page"`.
- `git diff --check` foi executado após ajustes documentais anteriores e não apontou problemas, apenas avisos normais de LF/CRLF no Windows.
- Na reorganização documental de 2026-04-30, foi feita leitura completa dos documentos, páginas HTML, CSS e scripts JavaScript antes das edições.
- Na reorganização documental de 2026-04-30, `rg` foi usado para localizar referências antigas a `HANDOFF` como memória operacional.
- Na reorganização documental de 2026-04-30, `git diff --check` e `git diff --cached --check` não apontaram erros de whitespace; `git check-ignore` confirmou que `AGENTS.md`, `docs/PROJECT_STATE.md` e `docs/HANDOFF.md` não estão ignorados.
- Na atualização de arquitetura suficiente em 2026-04-30, foram lidos README, AGENTS, PROJECT_STATE, HANDOFF, páginas HTML, CSS, scripts JavaScript, LICENSE e `.gitignore` antes das edições.

## Testes Pendentes

- Rodada manual completa em navegador real abrindo `index.html` e navegando por todos os módulos.
- Conferir console sem erros JavaScript em `descritiva.html`, `normalidade.html`, `controle.html` e `relatorio.html`.
- Testar os cinco exemplos didáticos em descritiva, normalidade e controle.
- Testar entradas simples, vírgula decimal e valores inválidos misturados.
- Testar exportação de CSV, cópia de relatórios e exportação de gráficos.
- Testar métodos de carta de controle: média ± 3 desvios padrão, média ± 2 desvios padrão e I-MR.
- Testar geração, impressão/PDF e limpeza do relatório consolidado.
- Conferir responsividade básica em largura menor.

## Próximos Passos

- Revisar o diff antes do próximo commit.
- Fazer rodada final de testes manuais em navegador real antes de marcar versão `v1.0.0`.
- Conferir impressão/PDF do relatório consolidado em desktop e notebook.
- Decidir se a dependência por CDN do Plotly é aceitável para a aula ou se será necessária cópia local.
- Se a versão mudar de `v0.9.0-beta` para `v1.0.0`, atualizar rodapés e README de forma consistente.

## Instrução de Retomada Rápida

Ao retomar uma tarefa não trivial:

1. Ler `README.md`.
2. Ler `AGENTS.md`.
3. Ler este `docs/PROJECT_STATE.md`.
4. Ler `docs/HANDOFF.md` apenas se a tarefa envolver passagem de contexto, continuidade de sessão ou retomada por outro agente.
5. Executar `git status` para separar alterações existentes de alterações novas.
6. Ler os arquivos diretamente afetados antes de editar.
7. Manter o projeto estático, didático, sem backend obrigatório e sem dados sensíveis.
