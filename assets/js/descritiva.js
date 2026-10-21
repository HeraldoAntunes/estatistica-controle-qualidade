// Estatística Aplicada ao Controle de Qualidade — © 2026 Heraldo Antunes — Licença MIT (ver LICENSE)
(function () {
  "use strict";

  const exampleSets = (window.CQExamples || []).map(function (example) {
    return {
      id: example.id,
      name: example.title,
      description: example.description,
      values: example.values,
      data: window.CQExampleTools.toBrazilianLines(example.values)
    };
  });

  const state = {
    values: [],
    items: [],
    invalids: [],
    stats: null
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function format(value, digits) {
    return StatsLab.formatNumber(value, digits === undefined ? 4 : digits);
  }

  function showMessage(type, html) {
    const element = $("parse-message");
    element.className = "message message-" + type;
    element.innerHTML = html;
  }

  function clearMessage() {
    const element = $("parse-message");
    element.className = "message";
    element.innerHTML = "";
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.style.position = "fixed";
    temporary.style.left = "-9999px";
    document.body.appendChild(temporary);
    temporary.focus();
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
    return Promise.resolve();
  }

  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderParseMessage(result) {
    if (!result.values.length) {
      showMessage("danger", "Nenhum valor numérico válido foi reconhecido.");
      return;
    }

    if (result.invalids.length) {
      const ignored = result.invalids.slice(0, 8).map(function (item) {
        return escapeHtml(item.raw);
      }).join(", ");
      const suffix = result.invalids.length > 8 ? "..." : "";
      showMessage(
        "warning",
        "Foram reconhecidos <strong>" + result.values.length + "</strong> valores válidos. " +
        "Valores ignorados: " + ignored + suffix + "."
      );
      return;
    }

    showMessage("success", "Foram reconhecidos <strong>" + result.values.length + "</strong> valores válidos.");
  }

  function renderPreview(items) {
    const body = $("preview-body");
    if (!items.length) {
      body.innerHTML = '<tr><td colspan="3">Nenhum dado analisado.</td></tr>';
      return;
    }

    body.innerHTML = items.map(function (item, index) {
      return "<tr>" +
        "<td>" + (index + 1) + "</td>" +
        "<td>" + escapeHtml(item.raw) + "</td>" +
        "<td>" + format(item.value) + "</td>" +
        "</tr>";
    }).join("");
  }

  function renderSummaryCards(stats) {
    $("summary-cards").innerHTML = [
      ["n", stats.n],
      ["Média", format(stats.mean)],
      ["Mediana", format(stats.median)],
      ["Desvio padrão", format(stats.sampleStdDev)],
      ["CV", stats.coefficientOfVariation === null ? "N/A" : format(stats.coefficientOfVariation, 2) + "%"],
      ["IIQ", format(stats.iqr)]
    ].map(function (card) {
      return '<div class="stat-card"><span>' + card[0] + '</span><strong>' + card[1] + '</strong></div>';
    }).join("");
  }

  function renderStatsTable(stats) {
    const modeText = formatModeText(stats);

    const rows = [
      ["Número de dados válidos (n)", stats.n, "Base para as demais medidas."],
      ["Média", format(stats.mean), "Centro aritmético dos resultados."],
      ["Mediana", format(stats.median), "Valor central após ordenar os dados."],
      ["Moda", modeText, "Valor ou valores mais frequentes, quando há repetição."],
      ["Mínimo", format(stats.min), "Menor valor observado."],
      ["Máximo", format(stats.max), "Maior valor observado."],
      ["Amplitude", format(stats.range), "Diferença entre máximo e mínimo."],
      ["Primeiro quartil (Q1)", format(stats.q1), "25% dos dados estão abaixo deste valor."],
      ["Segundo quartil (Q2)", format(stats.q2), "Equivale à mediana."],
      ["Terceiro quartil (Q3)", format(stats.q3), "75% dos dados estão abaixo deste valor."],
      ["Intervalo interquartil (IIQ = Q3 - Q1)", format(stats.iqr), "Mede a dispersão da metade central dos dados e é usado no critério do boxplot para indicar possíveis outliers."],
      ["Variância amostral", format(stats.sampleVariance), "Usa n - 1 no denominador."],
      ["Desvio padrão amostral", format(stats.sampleStdDev), "Mede dispersão em unidades do ensaio."],
      ["Desvio médio absoluto", format(stats.meanAbsoluteDeviation), "Média dos desvios absolutos em relação à média."],
      ["Coeficiente de variação", stats.coefficientOfVariation === null ? "N/A" : format(stats.coefficientOfVariation, 2) + "%", "Dispersão relativa à média."],
      ["Soma", format(stats.sum), "Total dos valores reconhecidos."],
      ["Assimetria", format(stats.skewness), "Valores positivos sugerem cauda à direita; negativos, à esquerda."],
      ["Curtose (excesso)", format(stats.kurtosis), "Valores altos indicam caudas mais pesadas que a normal, com cautela em amostras pequenas."]
    ];

    $("stats-body").innerHTML = rows.map(function (row) {
      return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td>" + row[2] + "</td></tr>";
    }).join("");
  }

  function formatModeText(stats) {
    return stats.mode.length ? stats.mode.map(function (value) {
      return format(value);
    }).join("; ") : "Sem moda evidente";
  }

  function formatOutliersText(stats) {
    if (!stats.boxplot || !stats.boxplot.outliers.length) {
      return "Nenhum possível outlier identificado pelo critério do boxplot.";
    }

    return stats.boxplot.outliers.map(function (item) {
      return "#" + (item.index + 1) + " = " + format(item.value);
    }).join("; ");
  }

  function buildInterpretation(stats) {
    const lines = [];
    const cv = stats.coefficientOfVariation;

    if (stats.n < 2) {
      lines.push("Há apenas um valor válido. Medidas de variabilidade amostral ainda não são informativas.");
      return lines;
    }

    if (cv === null) {
      lines.push("O coeficiente de variação não foi calculado porque a média é zero ou o desvio padrão não está disponível.");
    } else if (cv < 5) {
      lines.push("O coeficiente de variação é baixo para este conjunto, sugerindo baixa dispersão relativa dos resultados.");
    } else if (cv <= 15) {
      lines.push("O coeficiente de variação é moderado, sugerindo variabilidade perceptível, mas não necessariamente problemática.");
    } else {
      lines.push("O coeficiente de variação é alto, sugerindo um conjunto mais disperso. Vale investigar causas analíticas, operacionais ou de matriz.");
    }

    if (stats.sampleStdDev && Math.abs(stats.mean - stats.median) > 0.5 * stats.sampleStdDev) {
      lines.push("A média e a mediana apresentam diferença relevante em relação ao desvio padrão, o que pode indicar assimetria ou influência de valores extremos.");
    } else {
      lines.push("A média e a mediana estão relativamente próximas, o que sugere centro dos dados sem grande deslocamento aparente.");
    }

    if (stats.boxplot && stats.boxplot.outliers.length) {
      lines.push("Pelo critério do boxplot, há " + stats.boxplot.outliers.length + " possível(is) valor(es) extremo(s). Isso não significa erro, mas sugere verificação no contexto do método.");
    } else {
      lines.push("Pelo critério do boxplot, não foram identificados possíveis outliers.");
    }

    if (cv !== null && cv < 5 && (!stats.boxplot || !stats.boxplot.outliers.length)) {
      lines.push("Como leitura didática, o conjunto parece relativamente homogêneo.");
    } else {
      lines.push("Como leitura didática, o conjunto deve ser avaliado considerando objetivo, tolerâncias, método e histórico do laboratório.");
    }

    return lines;
  }

  function renderInterpretation(stats) {
    const lines = buildInterpretation(stats);
    $("interpretation").innerHTML = lines.map(function (line) {
      return "<p>" + line + "</p>";
    }).join("");

    if (stats.boxplot) {
      $("boxplot-limits").innerHTML = "<p><strong>Critério do boxplot:</strong> Limite inferior = " +
        format(stats.boxplot.lower) + "; Limite superior = " + format(stats.boxplot.upper) +
        "; IIQ = " + format(stats.boxplot.iqr) + ". Valores fora dessa faixa são marcados como possíveis outliers.</p>";
    }
  }

  function renderCharts(values) {
    LabCharts.plotHistogram("histogram-chart", values, "Histograma dos dados");
    LabCharts.plotBoxplot("boxplot-chart", values, "Boxplot com pontos individuais");
    LabCharts.plotLine("line-chart", values, "Dados na ordem inserida");
  }

  function buildResultsText() {
    if (!state.stats) {
      return "";
    }
    const stats = state.stats;
    return [
      "Relatório descritivo didático",
      "n: " + stats.n,
      "Média: " + format(stats.mean),
      "Mediana: " + format(stats.median),
      "Moda: " + formatModeText(stats),
      "Mínimo: " + format(stats.min),
      "Máximo: " + format(stats.max),
      "Amplitude: " + format(stats.range),
      "Q1: " + format(stats.q1),
      "Q2: " + format(stats.q2),
      "Q3: " + format(stats.q3),
      "IIQ: " + format(stats.iqr),
      "Variância amostral: " + format(stats.sampleVariance),
      "Desvio padrão amostral: " + format(stats.sampleStdDev),
      "Desvio médio absoluto: " + format(stats.meanAbsoluteDeviation),
      "Coeficiente de variação: " + (stats.coefficientOfVariation === null ? "N/A" : format(stats.coefficientOfVariation, 2) + "%"),
      "Assimetria: " + format(stats.skewness),
      "Curtose (excesso): " + format(stats.kurtosis),
      "Possíveis outliers: " + formatOutliersText(stats),
      "",
      "Interpretação didática:",
      buildInterpretation(stats).join(" "),
      "",
      "Observação: este relatório é um apoio didático. A decisão técnica deve considerar método, matriz, tolerâncias, histórico do laboratório e objetivo analítico."
    ].join("\n");
  }

  function saveAnalysis() {
    if (!state.stats) {
      return;
    }
    try {
      localStorage.setItem("cq_descritiva", JSON.stringify({
        values: state.values,
        items: state.items,
        invalidCount: state.invalids.length,
        stats: state.stats,
        interpretation: buildInterpretation(state.stats),
        report: buildResultsText(),
        generatedAt: new Date().toISOString()
      }));
    } catch (error) {
      // localStorage pode estar indisponível em alguns contextos locais.
    }
  }

  function analyzeData() {
    const result = LabParser.parseDataText($("data-input").value);
    state.values = result.values;
    state.items = result.items;
    state.invalids = result.invalids;
    state.stats = result.values.length ? StatsLab.descriptiveStats(result.values) : null;

    renderParseMessage(result);
    renderPreview(result.items);

    if (!state.stats) {
      return;
    }

    renderSummaryCards(state.stats);
    renderStatsTable(state.stats);
    renderInterpretation(state.stats);
    renderCharts(state.values);
    saveAnalysis();
  }

  function clearData() {
    $("data-input").value = "";
    $("csv-file").value = "";
    state.values = [];
    state.items = [];
    state.invalids = [];
    state.stats = null;
    clearMessage();
    renderPreview([]);
    $("summary-cards").innerHTML = "";
    $("stats-body").innerHTML = '<tr><td colspan="3">Analise um conjunto de dados para preencher a tabela.</td></tr>';
    $("interpretation").innerHTML = "<p>Insira dados para gerar uma interpretação automática.</p>";
    $("boxplot-limits").innerHTML = "";
    ["histogram-chart", "boxplot-chart", "line-chart"].forEach(function (id) {
      $(id).innerHTML = "";
    });
  }

  function downloadRecognizedData() {
    if (!state.values.length) {
      showMessage("warning", "Analise os dados antes de baixar a tabela.");
      return;
    }
    const rows = ["indice;valor"].concat(state.values.map(function (value, index) {
      return (index + 1) + ";" + String(value).replace(".", ",");
    }));
    downloadText("dados-reconhecidos.csv", rows.join("\n"));
  }

  function setupFileInput() {
    $("csv-file").addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        $("data-input").value = loadEvent.target.result;
        showMessage("info", "Arquivo carregado. Clique em <strong>Analisar dados</strong> para processar.");
      };
      reader.readAsText(file, "UTF-8");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupFileInput();
    CQExampleTools.renderButtons(function () {
      clearMessage();
    });
    $("analyze-data").addEventListener("click", analyzeData);
    $("clear-data").addEventListener("click", clearData);
    $("download-data").addEventListener("click", downloadRecognizedData);
    $("copy-results").addEventListener("click", function () {
      const text = buildResultsText();
      if (!text) {
        showMessage("warning", "Analise os dados antes de copiar o relatório.");
        return;
      }
      copyText(text).then(function () {
        showMessage("success", "Relatório copiado para a área de transferência.");
      });
    });
    $("export-histogram").addEventListener("click", function () {
      LabCharts.exportPlot("histogram-chart", "histograma-descritiva");
    });
    $("export-boxplot").addEventListener("click", function () {
      LabCharts.exportPlot("boxplot-chart", "boxplot-descritiva");
    });
    $("export-line").addEventListener("click", function () {
      LabCharts.exportPlot("line-chart", "serie-dados-descritiva");
    });
    $("export-all-charts").addEventListener("click", function () {
      LabCharts.exportMultiplePlots([
        { elementId: "histogram-chart", filename: "histograma-descritiva" },
        { elementId: "boxplot-chart", filename: "boxplot-descritiva" },
        { elementId: "line-chart", filename: "serie-dados-descritiva" }
      ]);
    });
  });

  window.DescriptiveLab = {
    exampleSets: exampleSets
  };
})();
