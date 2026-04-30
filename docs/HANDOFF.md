# HANDOFF.md

Documento oficial de passagem de contexto para outro chat, agente ou sessão. Este arquivo deve ser autocontido, técnico e acionável, mas não deve substituir `docs/PROJECT_STATE.md` como memória operacional contínua.

Atualizado em: 2026-04-30.

## Tema

Padronização da arquitetura de contexto do repositório para uso com Codex, OpenCode e outros agentes de IA.

## Status

Arquitetura documental reorganizada:

- `README.md`: guia humano do projeto.
- `AGENTS.md`: regras permanentes para agentes.
- `docs/PROJECT_STATE.md`: estado operacional vivo.
- `docs/HANDOFF.md`: passagem de contexto.

`AGENTS.md` também registra a diretriz permanente de arquitetura suficiente: evitar overengineering, camadas e patterns sem necessidade real documentada. Não houve alteração intencional em arquivos de código nessas atualizações documentais; revisar `git status` e `git diff` antes de qualquer commit.

## Complexidade

Baixa a média. A tarefa é documental, mas exige cuidado por envolver hierarquia de contexto, preservação do estado operacional útil e separação entre memória contínua e handoff.

## Objetivo

Separar corretamente as funções dos documentos de contexto do projeto:

- manter `AGENTS.md` como guia permanente;
- usar `docs/PROJECT_STATE.md` como memória operacional dinâmica;
- usar `docs/HANDOFF.md` apenas para transferência de contexto;
- explicar essa arquitetura também no `README.md`.

## Estado Atual

O projeto é uma aplicação web local, didática, em HTML5, CSS3 e JavaScript puro para apoio ao curso **Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte**.

O projeto não tem backend, banco de dados, processo de build ou suíte automatizada configurada. Deve continuar abrindo diretamente por `index.html`. Os gráficos usam Plotly.js por CDN e os módulos salvam análises no `localStorage` para compor o relatório consolidado.

O antigo uso de `docs/HANDOFF.md` como memória operacional foi convertido para `docs/PROJECT_STATE.md`. O handoff atual passa a ser uma síntese para transferência de contexto.

## Artefatos Principais

- `README.md`: documentação para pessoas, com uso, módulos, limitações e arquitetura de contexto.
- `AGENTS.md`: guia permanente para Codex, OpenCode e outros agentes.
- `docs/PROJECT_STATE.md`: estado operacional vivo, decisões em vigor, limitações, testes e próximos passos.
- `docs/HANDOFF.md`: este documento de passagem.
- `index.html`, `descritiva.html`, `normalidade.html`, `controle.html`, `relatorio.html`: páginas da aplicação.
- `assets/js/parser.js`: parsing de entrada com suporte a formatos brasileiros.
- `assets/js/estatistica.js`: funções estatísticas centrais.
- `assets/js/graficos.js`: funções Plotly e exportação de gráficos.
- `assets/js/exemplos.js`: exemplos didáticos compartilhados.
- `assets/js/descritiva.js`, `normalidade.js`, `controle.js`, `relatorio.js`: lógica de tela.
- `assets/css/style.css`: estilo global, responsividade e impressão.

## Decisões Tomadas

- `docs/PROJECT_STATE.md` substitui o antigo uso do handoff como memória operacional.
- `docs/HANDOFF.md` deve ser atualizado quando o usuário pedir passagem de contexto ou quando uma tarefa gerar ponto claro de transferência.
- `AGENTS.md` agora explicita a hierarquia: instrução do usuário, `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/HANDOFF.md`, `README.md` e código real como fonte final de comportamento executável.
- `AGENTS.md`, `docs/PROJECT_STATE.md` e `docs/HANDOFF.md` devem permanecer versionados e não devem entrar no `.gitignore`.
- O projeto deve permanecer estático, local, didático, sem backend obrigatório e sem dados sensíveis.
- A arquitetura deve ser suficiente para o problema atual: começar simples, evitar camadas rituais e criar abstrações apenas quando houver dor concreta e justificativa explícita.

## Questões Abertas

- Fazer rodada manual completa em navegador real.
- Conferir impressão/PDF do relatório consolidado.
- Decidir se Plotly.js continuará por CDN ou terá cópia local para uso sem internet.
- Se a versão passar de `v0.9.0-beta` para `v1.0.0`, atualizar README e rodapés de forma consistente.

## Restrições

- Não incluir chaves de API, tokens, senhas, credenciais, `.env` real, dados pessoais, dados de alunos, dados laboratoriais reais sensíveis, logs ou arquivos temporários.
- Não alterar `LICENSE` sem pedido explícito.
- Não alterar arquivos de código em tarefas documentais, salvo ajuste mínimo de referência quebrada.
- Não transformar `AGENTS.md`, `docs/PROJECT_STATE.md` ou `docs/HANDOFF.md` em diário de conversa.
- Não introduzir Clean Architecture completa, arquitetura hexagonal, CQRS, event sourcing, microservices, DDD tático completo, repository pattern formal ou dependency inversion sem justificativa explícita.
- Não afirmar normalidade de forma absoluta nem tratar alertas de carta de controle como invalidação automática.
- Preservar português do Brasil e finalidade didática.

## Estilo e Preferências Relevantes do Usuário

Documentado no projeto:

- linguagem clara, técnica e didática em português do Brasil;
- transparência sobre apoio de IA generativa, sem atribuir autoria principal à IA;
- mudanças pequenas, rastreáveis e coerentes com a estrutura estática existente;
- cuidado estatístico acima de aparência visual;
- preservação do funcionamento local por abertura direta de `index.html`.

## Próximo Passo Recomendado

Revisar `git status`, `git diff` e `git diff --cached` antes de commitar. Se houver mudanças de escopos diferentes, separar os commits.

## Instruções para a Próxima IA

1. Leia `README.md`, `AGENTS.md` e `docs/PROJECT_STATE.md` antes de editar.
2. Leia este `docs/HANDOFF.md` se estiver retomando contexto de outro chat, agente ou sessão.
3. Use `docs/PROJECT_STATE.md` como fonte de estado operacional, não este handoff.
4. Execute `git status` antes de modificar arquivos, pois pode haver alterações staged ou não staged de outra pessoa.
5. Preserve a arquitetura atual: aplicação estática, Plotly por CDN, sem backend obrigatório e sem build.
6. Antes de criar nova abstração, confirme que ela resolve problema real, tem usos concretos e reduz custo de manutenção.
7. Para mudanças estatísticas, atualizar README e `docs/PROJECT_STATE.md` quando houver alteração de fórmula, teste, critério, interpretação ou fluxo de relatório.
