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
    stats: null,
    tests: [],
    qqDiagnostics: null,
    probability: null
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

  function selectedAlpha() {
    return Number($("alpha-level").value);
  }

  function conclusionForTest(test, alpha) {
    if (test.available === false) {
      return "Não aplicado nesta versão.";
    }
    if (test.pValue === null || test.pValue === undefined || !Number.isFinite(test.pValue)) {
      return test.note || "Teste não calculado para este conjunto.";
    }
    if (test.pValue < alpha) {
      return "Há indícios de desvio em relação à normalidade no nível de significância escolhido.";
    }
    return "Não há evidência suficiente para rejeitar a normalidade no nível de significância escolhido.";
  }

  function renderSummaryCards(stats) {
    $("summary-cards").innerHTML = [
      ["n", stats.n],
      ["Média", format(stats.mean)],
      ["Desvio padrão", format(stats.sampleStdDev)],
      ["Mínimo", format(stats.min)],
      ["Máximo", format(stats.max)]
    ].map(function (card) {
      return '<div class="stat-card"><span>' + card[0] + '</span><strong>' + card[1] + '</strong></div>';
    }).join("");
  }

  function renderTests() {
    const alpha = selectedAlpha();
    const calculatedTests = state.tests.filter(function (test) {
      return test.pValue !== null && test.pValue !== undefined && Number.isFinite(test.pValue);
    });

    if (!calculatedTests.length) {
      $("tests-body").innerHTML = '<tr><td colspan="5">Analise os dados para preencher a tabela.</td></tr>';
      return;
    }

    $("tests-body").innerHTML = calculatedTests.map(function (test) {
      const tagClass = test.pValue < alpha ? "tag-warning" : "tag-ok";
      return "<tr>" +
        "<td><strong>" + test.name + "</strong><br><small>" + escapeHtml(test.note || "") + "</small></td>" +
        "<td>" + format(test.statistic) + "</td>" +
        "<td>" + StatsLab.formatPValue(test.pValue) + "</td>" +
        "<td>" + escapeHtml(test.recommendedUse || "Uso complementar, conforme contexto e tamanho amostral.") + "</td>" +
        "<td><span class=\"" + tagClass + "\">" + conclusionForTest(test, alpha) + "</span></td>" +
        "</tr>";
    }).join("");
  }

  function renderSampleGuidance() {
    if (!state.stats) {
      $("test-guidance").innerHTML = "<p>Analise os dados para receber uma recomendação didática por tamanho amostral.</p>";
      return;
    }
    $("test-guidance").innerHTML = "<p><strong>Regra didática por n:</strong> " +
      escapeHtml(StatsLab.normalitySampleGuidance(state.stats.n)) + "</p>";
  }

  function renderIntervals(stats) {
    const intervals = StatsLab.normalIntervals(stats.mean, stats.sampleStdDev);
    if (!intervals.length || !stats.sampleStdDev) {
      $("intervals-body").innerHTML = '<tr><td colspan="4">Não foi possível calcular intervalos com desvio padrão nulo ou indisponível.</td></tr>';
      $("intervals-chart").innerHTML = '<div class="message-warning">Não é possível gerar o gráfico dos intervalos com desvio padrão nulo.</div>';
      return;
    }

    $("intervals-body").innerHTML = intervals.map(function (interval) {
      return "<tr>" +
        "<td>Média ± " + interval.k + " desvio(s) padrão</td>" +
        "<td>" + format(interval.lower) + "</td>" +
        "<td>" + format(interval.upper) + "</td>" +
        "<td>Cerca de " + StatsLab.formatPercent(interval.approximateCoverage, 1) + " dos valores, se a distribuição for aproximadamente normal.</td>" +
        "</tr>";
    }).join("");
    LabCharts.plotNormalIntervals("intervals-chart", state.values, stats.mean, stats.sampleStdDev);
  }

  function mainTest() {
    return state.tests.find(function (test) {
      return test.available !== false && test.pValue !== null && test.pValue !== undefined && Number.isFinite(test.pValue);
    });
  }

  function buildInterpretation() {
    const stats = state.stats;
    const alpha = selectedAlpha();
    const primary = mainTest();
    const lines = [];

    if (!stats) {
      return ["Insira dados para gerar uma interpretação automática."];
    }

    if (primary) {
      lines.push(conclusionForTest(primary, alpha));
    } else {
      lines.push("Os testes não foram calculados para este conjunto. Verifique tamanho amostral e variabilidade.");
    }

    if (stats.n < 15) {
      lines.push("A amostra é pequena; testes de normalidade e gráficos devem ser interpretados com cautela.");
    }

    lines.push(StatsLab.normalitySampleGuidance(stats.n));

    if (stats.skewness !== null) {
      const absSkew = Math.abs(stats.skewness);
      if (absSkew < 0.5) {
        lines.push("A assimetria calculada é baixa, o que sugere forma aproximadamente equilibrada em torno da média.");
      } else if (stats.skewness > 0) {
        lines.push("A assimetria positiva sugere cauda à direita; valores maiores podem estar influenciando a média.");
      } else {
        lines.push("A assimetria negativa sugere cauda à esquerda; valores menores podem estar influenciando a média.");
      }
    }

    if (stats.boxplot && stats.boxplot.outliers.length) {
      lines.push("Há possível(is) valor(es) extremo(s) pelo critério do boxplot; isso pode afetar curva normal, média, desvio padrão e testes.");
    }

    if (primary && primary.pValue >= alpha && (!stats.boxplot || !stats.boxplot.outliers.length)) {
      lines.push("Os intervalos baseados em média e desvio padrão parecem razoáveis como aproximação didática para este conjunto.");
    } else {
      lines.push("Os intervalos μ ± kσ devem ser usados como apoio visual e não como garantia de comportamento normal.");
    }

    return lines;
  }

  function renderInterpretation() {
    $("interpretation").innerHTML = buildInterpretation().map(function (line) {
      return "<p>" + line + "</p>";
    }).join("");
  }

  function renderCharts(values, stats) {
    if (!stats.sampleStdDev) {
      $("normal-chart").innerHTML = '<div class="message-warning">Não é possível ajustar curva normal com desvio padrão nulo.</div>';
      $("qq-chart").innerHTML = '<div class="message-warning">Não é possível gerar Q-Q plot com desvio padrão nulo.</div>';
      $("qq-auto-interpretation").innerHTML = "<p>A leitura automática do Q-Q plot requer desvio padrão diferente de zero.</p>";
      return;
    }
    LabCharts.plotHistogramWithNormal("normal-chart", values, stats.mean, stats.sampleStdDev);
    LabCharts.plotQQPlot("qq-chart", values, stats.mean, stats.sampleStdDev);
    state.qqDiagnostics = StatsLab.qqPlotDiagnostics(values);
    $("qq-auto-interpretation").innerHTML = state.qqDiagnostics.lines.map(function (line) {
      return "<p>" + escapeHtml(line) + "</p>";
    }).join("");
  }

  function analyzeData() {
    const result = LabParser.parseDataText($("data-input").value);
    state.values = result.values;
    state.stats = result.values.length ? StatsLab.descriptiveStats(result.values) : null;
    state.tests = result.values.length ? StatsLab.normalityTests(result.values) : [];
    state.qqDiagnostics = null;
    state.probability = null;

    renderParseMessage(result);

    if (!state.stats) {
      return;
    }

    renderSummaryCards(state.stats);
    renderTests();
    renderSampleGuidance();
    renderIntervals(state.stats);
    renderInterpretation();
    renderCharts(state.values, state.stats);
    $("probability-chart").innerHTML = "";
    saveAnalysis();
  }

  function classifyZ(z) {
    const absolute = Math.abs(z);
    if (absolute <= 1) {
      return "dentro de ±1σ";
    }
    if (absolute <= 2) {
      return "entre ±1σ e ±2σ";
    }
    if (absolute <= 3) {
      return "entre ±2σ e ±3σ";
    }
    return "além de ±3σ";
  }

  function calculateProbability() {
    if (!state.stats) {
      $("probability-result").innerHTML = "<p>Analise os dados antes de calcular a probabilidade.</p>";
      return;
    }
    if (!state.stats.sampleStdDev) {
      $("probability-result").innerHTML = "<p>Não é possível calcular escore-z com desvio padrão nulo.</p>";
      return;
    }

    const value = LabParser.convertBrazilianNumber($("x-value").value);
    if (value === null) {
      $("probability-result").innerHTML = "<p>Informe um valor numérico válido para x.</p>";
      return;
    }

    const z = StatsLab.zScore(value, state.stats.mean, state.stats.sampleStdDev);
    const probability = StatsLab.normalCdf(value, state.stats.mean, state.stats.sampleStdDev);
    state.probability = {
      x: value,
      z: z,
      cumulativeProbability: probability,
      generatedAt: new Date().toISOString()
    };
    $("probability-result").innerHTML = "<p><strong>Escore-z:</strong> " + format(z, 4) + "</p>" +
      "<p><strong>P(X ≤ x):</strong> " + StatsLab.formatPercent(probability * 100, 2) + "</p>" +
      "<p><strong>Classificação:</strong> o valor está " + classifyZ(z) + " em relação à média.</p>" +
      "<p>A área sombreada representa a probabilidade acumulada P(X ≤ x), estimada pela curva normal ajustada aos dados.</p>";
    LabCharts.plotProbability("probability-chart", state.values, state.stats.mean, state.stats.sampleStdDev, value);
    saveAnalysis();
  }

  function buildResultsText() {
    if (!state.stats) {
      return "";
    }
    const alpha = selectedAlpha();
    const testLines = state.tests.filter(function (test) {
      return test.pValue !== null && test.pValue !== undefined && Number.isFinite(test.pValue);
    }).map(function (test) {
      return test.name + ": estatística = " + format(test.statistic) + ", p-valor = " + StatsLab.formatPValue(test.pValue) + ", conclusão = " + conclusionForTest(test, alpha);
    });
    const qqLines = state.qqDiagnostics ? state.qqDiagnostics.lines.join(" ") : "Q-Q plot não avaliado automaticamente.";
    return [
      "Relatório de normalidade",
      "n: " + state.stats.n,
      "Média: " + format(state.stats.mean),
      "Desvio padrão amostral: " + format(state.stats.sampleStdDev),
      "Nível de significância: " + StatsLab.formatPercent(alpha * 100, 0),
      "Regra didática por n: " + StatsLab.normalitySampleGuidance(state.stats.n),
      "",
      "Testes:",
      testLines.join("\n"),
      "",
      "Interpretação didática:",
      buildInterpretation().join(" "),
      "",
      "Observação sobre Q-Q plot:",
      qqLines,
      "",
      "Observação sobre intervalos média ± 1σ, ± 2σ e ± 3σ:",
      "Esses intervalos são aproximações úteis quando a distribuição é aproximadamente normal; não devem ser usados como prova de normalidade nem como critério único de aceitação."
    ].join("\n");
  }

  function saveAnalysis() {
    if (!state.stats) {
      return;
    }
    try {
      localStorage.setItem("cq_normalidade", JSON.stringify({
        values: state.values,
        stats: state.stats,
        tests: state.tests,
        qqDiagnostics: state.qqDiagnostics,
        probability: state.probability,
        interpretation: buildInterpretation(),
        report: buildResultsText(),
        generatedAt: new Date().toISOString()
      }));
      if (state.probability) {
        localStorage.setItem("cq_probabilidade", JSON.stringify({
          values: state.values,
          stats: state.stats,
          probability: state.probability,
          generatedAt: state.probability.generatedAt
        }));
      } else {
        localStorage.removeItem("cq_probabilidade");
      }
    } catch (error) {
      // localStorage pode estar indisponível em alguns contextos locais.
    }
  }

  function clearData() {
    $("data-input").value = "";
    $("csv-file").value = "";
    $("x-value").value = "";
    state.values = [];
    state.stats = null;
    state.tests = [];
    state.qqDiagnostics = null;
    state.probability = null;
    clearMessage();
    $("summary-cards").innerHTML = "";
    $("tests-body").innerHTML = '<tr><td colspan="5">Analise os dados para preencher a tabela.</td></tr>';
    renderSampleGuidance();
    $("intervals-body").innerHTML = '<tr><td colspan="4">Aguardando análise.</td></tr>';
    $("probability-result").innerHTML = "<p>Após analisar os dados, informe um valor para calcular o escore-z e a probabilidade acumulada aproximada.</p>";
    $("interpretation").innerHTML = "<p>Insira dados para gerar uma interpretação automática.</p>";
    $("normal-chart").innerHTML = "";
    $("qq-chart").innerHTML = "";
    $("intervals-chart").innerHTML = "";
    $("probability-chart").innerHTML = "";
    $("qq-auto-interpretation").innerHTML = "<p>Analise os dados para gerar uma leitura automática simples.</p>";
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
        showMessage("info", "Arquivo carregado. Clique em <strong>Avaliar normalidade</strong> para processar.");
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
    $("alpha-level").addEventListener("change", function () {
      if (state.stats) {
        renderTests();
        renderInterpretation();
        saveAnalysis();
      }
    });
    $("calculate-probability").addEventListener("click", calculateProbability);
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
    $("export-normal-chart").addEventListener("click", function () {
      LabCharts.exportPlot("normal-chart", "histograma-curva-normal");
    });
    $("export-intervals-chart").addEventListener("click", function () {
      LabCharts.exportPlot("intervals-chart", "intervalos-media-desvio-padrao");
    });
    $("export-probability-chart").addEventListener("click", function () {
      LabCharts.exportPlot("probability-chart", "probabilidade-acumulada");
    });
    $("export-qq-chart").addEventListener("click", function () {
      LabCharts.exportPlot("qq-chart", "qq-plot-normal");
    });
    $("export-normal-both").addEventListener("click", function () {
      LabCharts.exportMultiplePlots([
        { elementId: "normal-chart", filename: "histograma-curva-normal" },
        { elementId: "qq-chart", filename: "qq-plot-normal" }
      ]);
    });
  });

  window.NormalityLab = {
    exampleSets: exampleSets
  };
})();
