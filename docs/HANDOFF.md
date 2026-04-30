# HANDOFF.md

Documento temporário de handoff do projeto. Diferente de `AGENTS.md`, este arquivo pode registrar estado atual, decisões recentes e próximos passos sugeridos.

## Objetivo do Projeto

Aplicação web local e didática para apoiar o curso **Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte**, no contexto do Laboratório de Controle Ambiental (LCA).

A ferramenta permite trabalhar com dados laboratoriais em quatro módulos:

- estatística descritiva;
- curva normal e normalidade;
- carta de controle;
- relatório consolidado para impressão/PDF.

## Estado Atual

O projeto está em HTML, CSS e JavaScript puro. Não há backend, `package.json`, processo de build ou suíte automatizada configurada.

As páginas usam `assets/css/style.css` e scripts em `assets/js/`. Os gráficos dependem de Plotly.js por CDN.

O README identifica a versão atual como `v0.9.0-beta`, com licença MIT e contato institucional `lca.limoeiro@ifce.edu.br`.

Os módulos de análise salvam resultados no `localStorage` para o relatório consolidado:

- `cq_descritiva`;
- `cq_normalidade`;
- `cq_probabilidade`;
- `cq_controle`.

O arquivo `AGENTS.md` foi reestruturado como guia permanente para agentes de IA. Este `docs/HANDOFF.md` concentra o estado transitório.

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
- `README.md`: documentação de uso, limitações e critérios estatísticos.
- `LICENSE`: licença MIT.
- `AGENTS.md`: regras permanentes para agentes.

## Decisões Já Tomadas

- Manter aplicação local, sem backend obrigatório.
- Manter visual atual, com ajustes pontuais apenas quando necessário.
- Usar exemplos compartilhados em `assets/js/exemplos.js`.
- Lembrar o último exemplo escolhido com `localStorage` em `cq_selected_example`.
- Não exibir Shapiro-Wilk como linha calculada sem algoritmo validado no navegador.
- Usar linguagem cautelosa para normalidade: p-valor não prova normalidade.
- Diferenciar controle estatístico de limites legais ou operacionais.
- Tratar sinais da carta de controle como indicação de investigação, não invalidação automática.
- Usar relatório consolidado por reconstrução de dados e gráficos, evitando armazenar imagens pesadas no `localStorage`.
- Preservar aviso de implementação didática simplificada e vínculo institucional no rodapé.

## Próximos Passos Sugeridos

- Fazer uma rodada final de testes manuais em navegador real antes de marcar versão `v1.0.0`.
- Conferir impressão/PDF do relatório consolidado em desktop e notebook.
- Confirmar se a dependência por CDN do Plotly é aceitável para a aula ou se será necessária cópia local.
- Conferir se `AGENTS.md` e `docs/HANDOFF.md` devem ser adicionados ao próximo commit, pois `AGENTS.md` aparecia como não rastreado antes desta atualização.
- Se a versão mudar de `v0.9.0-beta` para `v1.0.0`, atualizar rodapés e README de forma consistente.

## Cuidados Estatísticos

- Não afirmar normalidade de forma absoluta.
- Manter claro que testes de normalidade avaliam evidência contra normalidade no nível de significância escolhido.
- Tratar p-valores aproximados como aproximações didáticas.
- Diferenciar `IIQ = Q3 - Q1` de amplitude total.
- Em carta de controle, distinguir limite estatístico, limite operacional e limite legal.
- Explicar que pontos fora dos limites, sequências e tendências sugerem investigação.
- Documentar no README qualquer mudança em fórmula, teste, critério de alerta, método de limite, exemplo didático ou interpretação automática.

## Rotina de Git para Desktop e Notebook

Ao começar em qualquer máquina:

```powershell
git pull origin main
git status
```

Durante o trabalho:

```powershell
git status
git diff
```

Ao finalizar alteração relevante:

```powershell
git status
git add .
git commit -m "Mensagem curta e clara"
git push
```

Antes de `git add .`, conferir se não há arquivos temporários, capturas, PDFs de teste, dados reais, `.env`, caches ou logs.

Ao alternar entre desktop e notebook, sempre puxar `main` antes de editar e enviar commit final ao encerrar a sessão de trabalho.
