# AGENTS.md

Guia permanente para Codex, OpenCode e outros agentes de IA que trabalhem neste repositório.

Este arquivo define regras estáveis de trabalho para o projeto. Ele não deve ser usado como handoff temporário, diário de bordo ou lista de pendências da sessão atual. Estado atual, decisões recentes, limitações, testes e próximos passos operacionais devem ficar em `docs/PROJECT_STATE.md`. O arquivo `docs/HANDOFF.md` deve ser usado apenas como documento oficial de passagem de contexto para outro chat, agente ou sessão.

## 1. Contexto do Projeto

Este repositório contém uma aplicação web local, didática, feita em HTML5, CSS3 e JavaScript puro para apoio ao curso **Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte**.

O projeto está associado ao Laboratório de Controle Ambiental (LCA) e apoia aulas e treinamentos sobre estatística aplicada ao controle de qualidade laboratorial.

O desenvolvimento e a documentação podem registrar apoio de IA generativa de forma transparente, sem atribuir autoria principal à IA e sem reduzir a necessidade de revisão humana.

A ferramenta deve continuar simples de abrir e usar:

- abrir `index.html` diretamente no navegador;
- não exigir backend, banco de dados ou processo de build;
- usar Plotly.js por CDN, salvo mudança documentada;
- funcionar como material didático, sem prometer validação formal para rotina acreditada.

## 2. Estrutura Real do Repositório

Estrutura observada:

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

Papéis principais:

- `index.html`: página inicial e navegação entre módulos.
- `descritiva.html`: estatística descritiva, prévia dos dados, gráficos e relatório descritivo.
- `normalidade.html`: curva normal, testes aproximados, Q-Q plot, intervalos e probabilidade acumulada.
- `controle.html`: carta de controle de indivíduos, métodos de limites, tabela de pontos e relatório.
- `relatorio.html`: relatório consolidado a partir de dados salvos no navegador.
- `assets/js/parser.js`: parsing de entrada com suporte a formatos brasileiros.
- `assets/js/estatistica.js`: funções estatísticas centrais.
- `assets/js/graficos.js`: funções Plotly e exportação de gráficos.
- `assets/js/exemplos.js`: exemplos didáticos compartilhados e seleção via `localStorage`.
- `assets/js/descritiva.js`, `normalidade.js`, `controle.js`: lógica específica de cada módulo.
- `assets/js/relatorio.js`: leitura de `localStorage`, reconstrução de gráficos e impressão.
- `assets/css/style.css`: estilo global, responsividade e regras de impressão.
- `docs/PROJECT_STATE.md`: estado operacional vivo do projeto.
- `docs/HANDOFF.md`: passagem de contexto para outro chat, agente ou sessão.

Antes de alterar nomes, caminhos, IDs de elementos, funções globais ou ordem dos scripts, revisar o impacto em HTML, CSS e JavaScript.

## 3. Prioridades de Trabalho

Em caso de conflito, seguir esta ordem:

1. Correção estatística.
2. Segurança e privacidade.
3. Funcionamento local no navegador.
4. Clareza didática em português do Brasil.
5. Coerência entre HTML, CSS, JavaScript e README.
6. Simplicidade operacional.
7. Aparência visual.

Não fazer refatorações grandes sem necessidade clara. Prefira mudanças pequenas, rastreáveis e compatíveis com o padrão atual.

## 4. Segurança, Privacidade e Dados

Nunca incluir no repositório:

- chaves de API;
- tokens;
- senhas;
- credenciais;
- arquivos `.env` reais;
- dados pessoais, acadêmicos, laboratoriais ou sensíveis reais;
- logs contendo dados privados.

Respeitar `.gitignore`. Se uma integração futura precisar de configuração local, usar variável de ambiente ou `.env.example` sem segredo.

Os exemplos em `assets/js/exemplos.js` devem permanecer fictícios, didáticos e plausíveis para controle de qualidade laboratorial.

O projeto salva dados de análises no `localStorage` para compor o relatório consolidado. Ao alterar esse fluxo, manter aviso claro ao usuário e evitar qualquer transmissão externa.

## 5. Cuidados Estatísticos Obrigatórios

### 5.1 Estatística Descritiva

Ao alterar cálculos ou textos da descritiva, conferir:

- `n` de dados válidos;
- média, mediana, moda, mínimo, máximo e amplitude;
- quartis e intervalo interquartil, apresentado como `IIQ = Q3 - Q1`;
- variância amostral e desvio padrão amostral;
- desvio médio absoluto;
- coeficiente de variação;
- assimetria e curtose;
- critério de possíveis outliers no boxplot;
- consistência entre cards, tabela, relatório e gráficos.

Se mudar método de quartis, variância, desvio padrão, outliers ou arredondamento, documentar no `README.md`.

### 5.2 Normalidade

Não afirmar normalidade de forma absoluta.

Evitar:

```text
Os dados são normais.
Os dados não são normais.
```

Preferir:

```text
Não há evidência suficiente para rejeitar a normalidade no nível de significância escolhido.
Há indícios de desvio em relação à normalidade no teste aplicado.
```

Manter claro que:

- p-valor não prova normalidade;
- testes formais têm limitações, especialmente com amostras pequenas;
- Q-Q plot e histograma são apoios visuais;
- intervalos `média ± kσ` são aproximações úteis quando a distribuição é aproximadamente normal;
- Shapiro-Wilk não deve aparecer como teste calculado se não houver implementação validada.

Se adicionar, remover ou alterar teste de normalidade, p-valor aproximado, regra por tamanho amostral ou interpretação automática, atualizar `README.md`.

### 5.3 Controle de Qualidade e Cartas de Controle

Ao alterar `controle.html`, `controle.js` ou gráficos de controle, distinguir sempre:

- limite estatístico de controle;
- limite operacional interno;
- limite legal, regulatório ou valor máximo permitido.

Não tratar esses limites como equivalentes.

A ferramenta atual usa, didaticamente:

- carta simples por média ± `k` desvios padrão do período-base;
- carta de indivíduos por amplitude móvel média, I-MR, com fator 2,66;
- sequência de 7 pontos acima ou abaixo da linha central;
- tendência de 6 pontos consecutivos aumentando ou diminuindo.

Sinais fora de limite, sequência ou tendência devem ser descritos como sinal de atenção ou sugestão de investigação, não como invalidação automática do resultado.

Se mudar método de limite, fator, critério de alerta, período-base, média móvel ou relatório da carta, documentar no `README.md`.

## 6. Arquitetura JavaScript

Preservar separação atual:

- parsing em `parser.js`;
- estatística reutilizável em `estatistica.js`;
- gráficos e exportação em `graficos.js`;
- exemplos compartilhados em `exemplos.js`;
- lógica de tela nos arquivos específicos de cada módulo.

Evitar duplicar fórmulas estatísticas em arquivos de tela quando já houver função central em `StatsLab`.

Ao introduzir função global nova, usar nomes consistentes com o padrão atual (`LabParser`, `StatsLab`, `LabCharts`, `CQExamples`, `CQExampleTools`).

Como o projeto é estático, não adicionar dependências, empacotadores, frameworks ou servidores obrigatórios sem motivo forte e documentação no README.

## 7. Interface e Linguagem

Manter a identidade visual atual: limpa, didática, técnica e discreta.

Usar português do Brasil na interface, relatórios e README.

Evitar jargão sem explicação. Quando usar termo técnico, explicar de forma curta.

Não reformular layout geral sem pedido explícito. Para ajustes visuais, preferir alterações pontuais em `assets/css/style.css`.

Preservar rodapé institucional e avisos de implementação didática simplificada.

## 8. Relatório Consolidado e Impressão

O relatório consolidado usa dados salvos em:

- `cq_descritiva`;
- `cq_normalidade`;
- `cq_probabilidade`;
- `cq_controle`.

Ao alterar esse fluxo:

- manter compatibilidade com dados salvos quando possível;
- evitar guardar imagens pesadas no `localStorage`;
- preferir recriar gráficos a partir dos dados;
- testar impressão/PDF;
- preservar avisos de limitação didática.

## 9. Testes Manuais Mínimos

Não há suíte automatizada configurada. Antes de finalizar mudança relevante, testar manualmente no navegador quando possível.

### 9.1 Todas as páginas

- Abrir `index.html`.
- Navegar para `descritiva.html`, `normalidade.html`, `controle.html` e `relatorio.html`.
- Conferir console do navegador sem erros JavaScript.
- Confirmar carregamento do Plotly pela CDN quando houver gráficos.
- Conferir responsividade básica em largura menor.

### 9.2 Descritiva

- Clicar nos 5 exemplos didáticos.
- Rodar análise.
- Conferir cards, tabela, interpretação, histograma, boxplot e série.
- Testar entrada simples: `1`, `2`, `3`, `4`, `5`.
- Testar vírgula decimal: `1,5`, `2,5`, `3,5`.
- Testar valor inválido misturado: `10`, `abc`, `12`.
- Testar baixar CSV, copiar relatório e exportar gráficos.

### 9.3 Normalidade

- Clicar nos 5 exemplos didáticos.
- Rodar avaliação de normalidade.
- Conferir tabela de testes calculados e ausência de Shapiro-Wilk como linha calculada.
- Conferir histograma com curva normal, Q-Q plot, gráfico de intervalos e interpretação.
- Calcular probabilidade acumulada para um valor `x`.
- Testar exportação dos gráficos.
- Garantir linguagem cuidadosa: não afirmar normalidade como fato absoluto.

### 9.4 Controle

- Clicar nos 5 exemplos didáticos.
- Testar método média ± 3 desvios padrão.
- Testar método média ± 2 desvios padrão.
- Testar método I-MR.
- Ativar e desativar média móvel, série temporal, período-base e pontos fora dos limites.
- Conferir tabela com coluna `Critério usado`.
- Conferir relatório com método, período-base, LIC, LSC e critérios de alerta.
- Testar baixar CSV, copiar relatório e exportar gráfico.

### 9.5 Relatório Consolidado

- Gerar análises nos módulos anteriores.
- Abrir `relatorio.html`.
- Clicar em `Gerar relatório`.
- Conferir tabelas, textos, gráficos e avisos.
- Testar impressão/PDF, verificando se os gráficos não são cortados.
- Testar `Limpar relatório salvo` em computador compartilhado ou simulação local.

## 10. Fluxo de Git em Duas Máquinas

Este projeto pode ser editado em desktop e notebook. Para evitar divergências:

### Ao começar em qualquer máquina

```powershell
git pull origin main
git status
```

Se houver alterações locais não commitadas, entender se são suas antes de sobrescrever qualquer coisa.

### Durante o trabalho

```powershell
git status
git diff
```

Revisar o diff antes de concluir. Não reverter alterações de outra pessoa sem pedido explícito.

### Ao terminar uma alteração relevante

```powershell
git status
git add .
git commit -m "Mensagem curta e clara"
git push
```

Antes de `git add .`, conferir se não há arquivos temporários, PDFs de teste, capturas, dados reais, `.env` ou caches.

Mensagens de commit devem ser específicas, por exemplo:

```text
Atualiza guia para agentes
Refina testes de normalidade
Melhora impressão do relatório
Corrige critérios da carta de controle
```

## 11. README e Documentação

Atualizar `README.md` quando houver mudança em:

- fórmulas estatísticas;
- testes de normalidade;
- critérios de controle;
- exemplos didáticos;
- fluxo de relatório;
- dependências;
- limitações de uso;
- versão, contato, licença ou tecnologias.

Manter `AGENTS.md` como guia permanente.

Usar `docs/PROJECT_STATE.md` para estado operacional contínuo, próximos passos, limitações, testes realizados e decisões em vigor.

Usar `docs/HANDOFF.md` para passagem de contexto a outro chat, agente ou sessão. O handoff não substitui `docs/PROJECT_STATE.md`.

## 12. Arquitetura de Contexto para Agentes

A hierarquia de contexto do projeto é:

1. Instrução explícita do usuário na conversa atual.
2. `AGENTS.md`.
3. `docs/PROJECT_STATE.md`.
4. `docs/HANDOFF.md`.
5. `README.md`.
6. Código real do projeto como fonte final de comportamento executável.

Papéis dos arquivos:

- `README.md`: guia humano do projeto, com objetivo, uso, estrutura básica, limitações e critérios didáticos.
- `AGENTS.md`: guia permanente para agentes de IA, com regras estáveis de arquitetura, estatística, segurança, documentação, Git e conduta.
- `docs/PROJECT_STATE.md`: estado operacional vivo do projeto. Deve registrar estado atual, decisões em vigor, arquivos principais, pendências, limitações, testes feitos, testes pendentes, próximos passos e instrução de retomada rápida.
- `docs/HANDOFF.md`: documento oficial de passagem de contexto. Deve ser autocontido, denso, técnico e acionável para levar o projeto a outro chat, outro agente ou outra sessão. Não deve ser usado como memória operacional principal.

Ao iniciar qualquer tarefa não trivial, o agente deve ler, nesta ordem:

1. `README.md`;
2. `AGENTS.md`;
3. `docs/PROJECT_STATE.md`;
4. `docs/HANDOFF.md`, se a tarefa envolver retomada de contexto, passagem para outro chat, passagem para outro agente ou continuidade de sessão;
5. arquivos diretamente relacionados à tarefa.

Depois dessa leitura, o agente deve usar `docs/PROJECT_STATE.md` para entender o estado operacional atual antes de propor ou executar alterações.

Ao finalizar qualquer alteração relevante, o agente deve:

- avaliar se `docs/PROJECT_STATE.md` precisa ser atualizado;
- atualizar `docs/PROJECT_STATE.md` quando houver mudança de estado, decisão, comportamento, limitação, teste realizado, teste pendente ou próximo passo;
- atualizar `docs/HANDOFF.md` quando o usuário pedir uma passagem de contexto ou quando a tarefa gerar um ponto claro de transferência para outro chat, agente ou sessão;
- recomendar atualização do `AGENTS.md` quando regras permanentes tiverem mudado, mas não alterar `AGENTS.md` sem pedido explícito do usuário.

O `PROJECT_STATE` não deve virar diário de conversa. Manter o conteúdo denso, técnico, limpo e acionável. Evitar registros redundantes, comentários de sessão sem valor futuro ou histórico detalhado de cada tentativa.

O `HANDOFF` também não deve virar diário de conversa. Ele deve sintetizar o contexto necessário para transferência, sem substituir o estado operacional contínuo.

`AGENTS.md`, `docs/PROJECT_STATE.md` e `docs/HANDOFF.md` devem permanecer versionados e não devem ser incluídos no `.gitignore`.

Nenhum desses arquivos deve conter chaves de API, tokens, senhas, dados reais sensíveis, dados de alunos, dados laboratoriais privados ou qualquer informação pessoal.

O agente não deve alterar `AGENTS.md` automaticamente. Se perceber que regras permanentes ficaram desatualizadas, deve recomendar a atualização do `AGENTS.md` ao usuário. Alterar `AGENTS.md` somente quando houver pedido explícito.

Se `docs/PROJECT_STATE.md` não existir, o agente deve propor sua criação ou criá-lo quando a tarefa solicitar reorganização documental. Se existir um `HANDOFF.md` na raiz, avaliar se o conteúdo deve ser movido para `docs/HANDOFF.md` ou convertido para `docs/PROJECT_STATE.md`, conforme sua função real.

## 13. Licença

Não alterar `LICENSE` sem pedido explícito do usuário.

Se for necessário discutir licença, explicar antes o impacto prático. A licença atual é MIT.

## 14. Conduta do Agente

Antes de editar, ler o contexto real do projeto. Para mudanças não triviais, revisar pelo menos:

- `README.md`;
- `AGENTS.md`;
- `docs/PROJECT_STATE.md`;
- `docs/HANDOFF.md`, quando a tarefa envolver continuidade ou passagem de contexto;
- páginas HTML afetadas;
- scripts em `assets/js`;
- `assets/css/style.css`.

Ao responder, informar:

- arquivos alterados;
- impacto das mudanças;
- testes realizados;
- limitações do que não foi testado.

Não fingir validação que não foi feita.

Este projeto deve permanecer uma ferramenta didática, local, clara, estatisticamente cuidadosa e segura para apoio ao ensino de controle de qualidade laboratorial.
