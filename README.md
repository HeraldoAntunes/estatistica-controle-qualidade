# Estatística Aplicada ao Controle de Qualidade

Material didático de apoio ao curso **Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte**.

O projeto foi feito em HTML, CSS e JavaScript puro para uso em aula prática, laboratório de informática ou treinamento, sem instalação de programas.

## Aviso de uso

Esta é uma implementação didática simplificada. Ela não substitui softwares estatísticos, planilhas validadas, sistemas LIMS, ferramentas formalmente verificadas para rotina acreditada ou procedimento documentado do laboratório.

## Objetivo

A ferramenta permite inserir dados laboratoriais, tratar números em formato brasileiro, calcular estatísticas descritivas, visualizar gráficos, avaliar aderência aproximada à distribuição normal, construir cartas de controle e gerar um relatório consolidado para impressão.

O projeto apoia discussões sobre garantia da validade dos resultados, controles internos da qualidade e requisito 7.7 da ABNT NBR ISO/IEC 17025.

## Estrutura

```text
estatistica-controle-qualidade/
├── index.html
├── descritiva.html
├── normalidade.html
├── controle.html
├── relatorio.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── parser.js
│       ├── exemplos.js
│       ├── estatistica.js
│       ├── graficos.js
│       ├── descritiva.js
│       ├── normalidade.js
│       ├── controle.js
│       └── relatorio.js
└── README.md
```

## Como abrir

Abra `index.html` diretamente no navegador.

O projeto não usa backend. Os gráficos usam Plotly.js por CDN, então a geração e exportação dos gráficos dependem de acesso à internet ou de adaptação para uma cópia local da biblioteca.

## Entrada de dados

Em cada módulo, é possível colar valores, carregar `.csv`/texto ou digitar manualmente.

O parser aceita formatos como `12,5`, `1234,56`, `1.234,56` e `1234.56`. Valores não numéricos são ignorados e informados ao usuário.

## Módulos

`descritiva.html` calcula medidas descritivas, mostra prévia dos dados, histograma, boxplot, série temporal e relatório descritivo.

`normalidade.html` mostra histograma com curva normal ajustada, Q-Q plot, tabela e gráfico dos intervalos média ± desvio padrão, testes aproximados de normalidade e gráfico de probabilidade acumulada.

`controle.html` gera carta de controle com método por média ± k desvios padrão ou método I-MR por amplitude móvel média, tabela de pontos, alertas de sequência/tendência e relatório copiável.

`relatorio.html` lê as últimas análises salvas no `localStorage`, reconstrói tabelas e gráficos principais e gera um relatório consolidado para impressão ou PDF pelo navegador.

## Exemplos didáticos

Os exemplos agora são compartilhados em `assets/js/exemplos.js`. O mesmo conjunto numérico é usado em estatística descritiva, normalidade e carta de controle; muda apenas a lente de análise.

Cada página mostra botões individuais de exemplo. O último exemplo escolhido é salvo em `localStorage` como `cq_selected_example`, para que os outros módulos destaquem a mesma opção quando forem abertos. A análise não é executada automaticamente.

Tipologias disponíveis:

- Processo estável: material de controle próximo de 10,00 unidades, com pequena variação aleatória.
- Ponto fora de controle: período-base estável e um resultado posterior plausivelmente fora do LSC.
- Tendência gradual: aumento progressivo após o período-base, simulando deriva instrumental ou envelhecimento de reagente.
- Mudança de patamar: segunda parte em média um pouco maior, simulando troca de lote, recalibração ou alteração operacional.
- Aumento de dispersão: média semelhante, mas piora de repetibilidade após o período-base.

Os exemplos são didáticos e não representam limites reais de um método específico.

## Estatística descritiva

A página calcula n, média, mediana, moda, mínimo, máximo, amplitude, quartis, variância amostral, desvio padrão amostral, desvio médio absoluto, coeficiente de variação, assimetria e curtose.

O **intervalo interquartil** é apresentado como **IIQ = Q3 - Q1**. Ele mede a dispersão da metade central dos dados e é usado no critério do boxplot para indicar possíveis outliers.

Exportações disponíveis:

- Histograma.
- Boxplot.
- Série na ordem inserida.
- Todos os gráficos.
- CSV dos dados reconhecidos.
- Relatório descritivo.

## Normalidade

A tabela mostra apenas testes calculados nesta versão:

- Anderson-Darling: p-valor aproximado, com maior sensibilidade nas caudas.
- Jarque-Bera: baseado em assimetria e curtose; mais adequado para amostras maiores.
- Lilliefors: alternativa ao KS quando média e desvio padrão são estimados da própria amostra; p-valor aproximado por simulação determinística.
- D'Agostino-Pearson: combina assimetria e curtose; mais útil em amostras moderadas a grandes.

O teste de Shapiro-Wilk não é exibido na tabela porque não foi implementado com algoritmo validado no navegador. Para uso formal, recomenda-se aplicar esse teste em software estatístico validado.

Regra didática exibida na interface:

- `n < 8`: testes formais são frágeis; priorize inspeção visual.
- `8 ≤ n < 30`: Shapiro-Wilk seria preferencial se aplicado em software validado; use Anderson-Darling e Q-Q plot como apoio.
- `30 ≤ n < 50`: combine Anderson-Darling, Lilliefors aproximado e avaliação gráfica.
- `n ≥ 50`: inclua Jarque-Bera, Lilliefors e D'Agostino-Pearson como apoio.

Gráficos adicionais:

- Visualização dos intervalos μ ± 1σ, μ ± 2σ e μ ± 3σ.
- Probabilidade acumulada até x, com área sombreada sob a curva normal ajustada.

## Q-Q plot

O Q-Q plot compara quantis observados com quantis esperados sob normalidade.

- Pontos próximos da linha sugerem compatibilidade visual com normalidade.
- Curvatura sistemática sugere assimetria.
- Pontos afastados nas extremidades sugerem atenção às caudas.
- Pontos isolados muito distantes podem indicar outliers.

O Q-Q plot não prova normalidade; ele ajuda a enxergar padrões.

## Cartas de controle

A página oferece dois métodos de limites.

### Média ± k desvios padrão

```text
Linha central = média do período-base
LSC = média + k × desvio padrão amostral do período-base
LIC = média - k × desvio padrão amostral do período-base
```

Esse método é usado como carta simples ou apoio tipo Levey-Jennings.

### I-MR por amplitude móvel média

```text
MR_i = |X_i - X_{i-1}|
MR̄ = média das amplitudes móveis do período-base
Linha central = média do período-base
LSC = média + 2,66 × MR̄
LIC = média - 2,66 × MR̄
```

O fator 2,66 é usado para carta de indivíduos com amplitude móvel de 2 pontos.

Critérios didáticos de alerta exibidos na tabela e no relatório:

- Fora do limite superior: `valor > LSC`.
- Fora do limite inferior: `valor < LIC`.
- Dentro dos limites: `LIC ≤ valor ≤ LSC`.
- Sequência acima ou abaixo da linha central: 7 pontos consecutivos.
- Tendência crescente ou decrescente: 6 pontos consecutivos aumentando ou diminuindo.

Esses sinais indicam necessidade de investigação e não invalidam automaticamente o resultado.

## Relação com a ISO/IEC 17025

A carta de controle apoia didaticamente o estudo do requisito 7.7, ligado à garantia da validade dos resultados. A ferramenta registra dados em tabela e relatório, mostra técnica estatística usada, limites, linha central, tendências e sinais de atenção.

Ela não comprova conformidade. Procedimentos, critérios de aceitação, frequência, registros, rastreabilidade, validação formal e ações quando houver resultados fora dos critérios dependem do laboratório.

## Relatório consolidado

Os módulos salvam no navegador os últimos resultados em:

- `cq_descritiva`
- `cq_normalidade`
- `cq_probabilidade`
- `cq_controle`

O módulo `relatorio.html` recria tabelas e gráficos a partir desses dados. Ele permite gerar relatório, imprimir e limpar dados salvos.

Para impressão/PDF, cada gráfico importante é renderizado em bloco próprio. O CSS de impressão usa página A4 em retrato e evita que cards, tabelas e gráficos sejam divididos entre páginas. O módulo também tenta gerar imagens PNG dos gráficos Plotly antes da impressão para reduzir cortes no PDF.

## Limitações

As interpretações são didáticas. O p-valor não prova normalidade. Um ponto fora dos limites não significa automaticamente resultado inválido. Amostras pequenas exigem cautela.

Avalie sinais de atenção junto com método, calibração, branco, controle interno, histórico do laboratório, matriz, tolerâncias e objetivo analítico.
