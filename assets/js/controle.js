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
    limits: null,
    movingAverage: [],
    rows: [],
    report: ""
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

  function calculateMovingRanges(values) {
    const ranges = [];
    for (let i = 1; i < values.length; i += 1) {
      ranges.push(Math.abs(values[i] - values[i - 1]));
    }
    return ranges;
  }

  function calculateControlLimits(values, baseSize, sigmaMultiplier, forceZero, method) {
    const cleanValues = StatsLab.cleanData(values);
    const baseN = Math.floor(Number(baseSize));
    const sigma = Number(sigmaMultiplier);
    const selectedMethod = method === "imr" ? "imr" : "sigma";

    if (!Number.isFinite(baseN) || baseN < 2) {
      return { error: "O período-base deve ter pelo menos 2 dados." };
    }

    if (cleanValues.length < baseN) {
      return { error: "Há menos dados válidos do que o período-base escolhido." };
    }

    const baseValues = cleanValues.slice(0, baseN);
    const center = StatsLab.mean(baseValues);
    const sd = StatsLab.sampleStdDev(baseValues);

    if (selectedMethod === "imr") {
      const movingRanges = calculateMovingRanges(baseValues);
      const mrAverage = StatsLab.mean(movingRanges);

      if (!mrAverage) {
        return { error: "A amplitude móvel média do período-base é nula ou indisponível." };
      }

      let imrLcl = center - 2.66 * mrAverage;
      if (forceZero && imrLcl < 0) {
        imrLcl = 0;
      }

      return {
        method: "imr",
        methodName: "Carta de indivíduos com amplitude móvel, I-MR",
        baseSize: baseN,
        sigmaMultiplier: null,
        forceZero: Boolean(forceZero),
        center: center,
        sd: sd,
        movingRanges: movingRanges,
        mrAverage: mrAverage,
        ucl: center + 2.66 * mrAverage,
        lcl: imrLcl,
        baseValues: baseValues
      };
    }

    if (!sd) {
      return { error: "O desvio padrão do período-base é nulo ou indisponível." };
    }

    let lcl = center - sigma * sd;
    if (forceZero && lcl < 0) {
      lcl = 0;
    }

    return {
      method: "sigma",
      methodName: "Carta de controle simples por média ± k desvios padrão",
      baseSize: baseN,
      sigmaMultiplier: sigma,
      forceZero: Boolean(forceZero),
      center: center,
      sd: sd,
      mrAverage: null,
      ucl: center + sigma * sd,
      lcl: lcl,
      baseValues: baseValues
    };
  }

  function calculateMovingAverage(values, windowSize) {
    const size = Math.floor(Number(windowSize));
    return values.map(function (_, index) {
      if (!Number.isFinite(size) || size < 2 || index + 1 < size) {
        return null;
      }
      return StatsLab.mean(values.slice(index - size + 1, index + 1));
    });
  }

  function detectSequences(values, center, minimumLength) {
    const minLength = minimumLength || 7;
    const above = Array(values.length).fill(false);
    const below = Array(values.length).fill(false);
    const runs = [];
    let side = null;
    let start = 0;
    let length = 0;

    function closeRun(endIndex) {
      if (!side || length < minLength) {
        return;
      }
      const target = side === "above" ? above : below;
      for (let i = start; i <= endIndex; i += 1) {
        target[i] = true;
      }
      runs.push({ side: side, start: start, end: endIndex, length: length });
    }

    values.forEach(function (value, index) {
      const currentSide = value > center ? "above" : value < center ? "below" : null;
      if (!currentSide) {
        closeRun(index - 1);
        side = null;
        length = 0;
        start = index + 1;
        return;
      }

      if (currentSide === side) {
        length += 1;
      } else {
        closeRun(index - 1);
        side = currentSide;
        start = index;
        length = 1;
      }
    });

    closeRun(values.length - 1);
    return { above: above, below: below, runs: runs };
  }

  function detectTrends(values, minimumLength) {
    const minLength = minimumLength || 6;
    const increasing = Array(values.length).fill(false);
    const decreasing = Array(values.length).fill(false);
    const trends = [];
    let direction = 0;
    let start = 0;

    function markTrend(endIndex) {
      const length = endIndex - start + 1;
      if (!direction || length < minLength) {
        return;
      }
      const target = direction > 0 ? increasing : decreasing;
      for (let i = start; i <= endIndex; i += 1) {
        target[i] = true;
      }
      trends.push({ direction: direction > 0 ? "increasing" : "decreasing", start: start, end: endIndex, length: length });
    }

    for (let i = 1; i < values.length; i += 1) {
      const currentDirection = values[i] > values[i - 1] ? 1 : values[i] < values[i - 1] ? -1 : 0;

      if (!currentDirection) {
        markTrend(i - 1);
        direction = 0;
        start = i;
        continue;
      }

      if (!direction) {
        direction = currentDirection;
        start = i - 1;
      } else if (currentDirection !== direction) {
        markTrend(i - 1);
        direction = currentDirection;
        start = i - 1;
      }
    }

    markTrend(values.length - 1);
    return { increasing: increasing, decreasing: decreasing, trends: trends };
  }

  function analyzeControlPoints(values, limits) {
    const sequences = detectSequences(values, limits.center, 7);
    const trends = detectTrends(values, 6);

    return values.map(function (value, index) {
      const aboveUcl = value > limits.ucl;
      const belowLcl = value < limits.lcl;
      const status = [];
      const criteria = [];

      if (aboveUcl) {
        status.push("acima do LSC");
        criteria.push("valor > LSC");
      } else if (belowLcl) {
        status.push("abaixo do LIC");
        criteria.push("valor < LIC");
      } else {
        status.push("dentro dos limites");
        criteria.push("LIC ≤ valor ≤ LSC");
      }

      if (sequences.above[index]) {
        status.push("alerta de sequência acima da linha central");
        criteria.push("7 pontos consecutivos acima da linha central");
      }
      if (sequences.below[index]) {
        status.push("alerta de sequência abaixo da linha central");
        criteria.push("7 pontos consecutivos abaixo da linha central");
      }
      if (trends.increasing[index]) {
        status.push("alerta de tendência crescente");
        criteria.push("6 pontos consecutivos em aumento");
      }
      if (trends.decreasing[index]) {
        status.push("alerta de tendência decrescente");
        criteria.push("6 pontos consecutivos em queda");
      }

      return {
        index: index + 1,
        value: value,
        inBasePeriod: index < limits.baseSize,
        aboveUcl: aboveUcl,
        belowLcl: belowLcl,
        sequenceAbove: sequences.above[index],
        sequenceBelow: sequences.below[index],
        trendIncreasing: trends.increasing[index],
        trendDecreasing: trends.decreasing[index],
        status: status,
        criteria: criteria
      };
    });
  }

  function generateControlReport(values, limits, rows) {
    const outsideRows = rows.filter(function (row) {
      return row.aboveUcl || row.belowLcl;
    });
    const outsideCount = rows.filter(function (row) {
      return row.aboveUcl || row.belowLcl;
    }).length;
    const aboveCount = rows.filter(function (row) {
      return row.aboveUcl;
    }).length;
    const belowCount = rows.filter(function (row) {
      return row.belowLcl;
    }).length;
    const sequenceCount = rows.filter(function (row) {
      return row.sequenceAbove || row.sequenceBelow;
    }).length;
    const trendCount = rows.filter(function (row) {
      return row.trendIncreasing || row.trendDecreasing;
    }).length;
    const alerts = [];

    if (aboveCount) {
      alerts.push(aboveCount + " ponto(s) acima do LSC");
    }
    if (belowCount) {
      alerts.push(belowCount + " ponto(s) abaixo do LIC");
    }
    if (sequenceCount) {
      alerts.push(sequenceCount + " ponto(s) em sequência longa em relação à linha central");
    }
    if (trendCount) {
      alerts.push(trendCount + " ponto(s) associados a tendência crescente ou decrescente");
    }
    if (!alerts.length) {
      alerts.push("nenhum alerta simples foi identificado");
    }

    const outsideText = outsideRows.length ? outsideRows.map(function (row) {
      return "#" + row.index + " = " + format(row.value) + (row.aboveUcl ? " (acima do LSC)" : " (abaixo do LIC)");
    }).join("; ") : "Nenhum ponto fora dos limites.";
    const sequenceText = sequenceCount
      ? "Há sinal de sequência acima ou abaixo da linha central em " + sequenceCount + " ponto(s)."
      : "Não foi identificada sequência longa acima ou abaixo da linha central.";
    const trendText = trendCount
      ? "Há sinal de tendência crescente ou decrescente em " + trendCount + " ponto(s)."
      : "Não foi identificada tendência simples pelo critério didático implementado.";
    const interpretation = outsideCount || sequenceCount || trendCount
      ? "Há sinal de atenção que sugere investigação no contexto do método, rotina, calibração, branco, controle interno e histórico do laboratório. Isso não significa automaticamente resultado inválido."
      : "Não foram observados sinais simples de atenção pelos critérios didáticos implementados. A avaliação técnica continua necessária junto com método, calibração, branco, controle interno e histórico do laboratório.";

    const methodLines = limits.method === "imr"
      ? [
        "Método usado: " + limits.methodName,
        "Variação estimada por amplitude móvel média de 2 pontos.",
        "MR médio do período-base: " + format(limits.mrAverage),
        "Fator usado para limites I-MR: 2,66"
      ]
      : [
        "Método usado: " + limits.methodName,
        "Critério dos limites: média ± " + limits.sigmaMultiplier + " desvios padrão",
        "Desvio padrão do período-base: " + format(limits.sd)
      ];

    return [
      "Relatório didático da carta de controle de indivíduos",
      "Quantidade total de dados: " + values.length,
      "Período-base usado: " + limits.baseSize + " primeiros dados"
    ].concat(methodLines).concat([
      "Média do período-base: " + format(limits.center),
      "LIC: " + format(limits.lcl) + (limits.forceZero ? " (forçado para mínimo zero quando aplicável)" : ""),
      "LSC: " + format(limits.ucl),
      "Critérios definidos para esta análise: método, período-base, linha central, LIC e LSC informados acima.",
      "Observação sobre o período-base: os limites foram estimados a partir dos dados iniciais definidos pelo usuário. Em rotina laboratorial, esse critério deve estar previsto em procedimento documentado.",
      "",
      "Critérios de alerta:",
      "- Fora do limite superior: valor > LSC.",
      "- Fora do limite inferior: valor < LIC.",
      "- Sequência: 7 pontos consecutivos acima ou abaixo da linha central.",
      "- Tendência: 6 pontos consecutivos aumentando ou diminuindo.",
      "",
      "Número de pontos fora dos limites: " + outsideCount,
      "Pontos fora dos limites: " + outsideText,
      "Sequências: " + sequenceText,
      "Tendência: " + trendText,
      "Principais alertas: " + alerts.join("; "),
      "Interpretação geral: " + interpretation,
      "Ação didática sugerida quando há sinal de atenção: investigar antes de concluir erro, avaliando método, calibração, branco, controle interno, registros e histórico do laboratório.",
      "Rastreabilidade e validação formal: dependem do procedimento documentado do laboratório; esta ferramenta não comprova conformidade com a ISO/IEC 17025."
    ]).join("\n");
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

  function statusToHtml(status) {
    return status.map(function (item) {
      let className = "tag-ok";
      if (item.includes("LSC") || item.includes("LIC")) {
        className = "tag-danger";
      } else if (item.includes("alerta")) {
        className = "tag-warning";
      }
      return '<span class="' + className + '">' + escapeHtml(item) + '</span>';
    }).join(" ");
  }

  function renderTable(rows) {
    const body = $("control-table-body");
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="5">Gere a carta para preencher a tabela.</td></tr>';
      return;
    }

    body.innerHTML = rows.map(function (row) {
      return "<tr>" +
        "<td>" + row.index + "</td>" +
        "<td>" + format(row.value) + "</td>" +
        "<td>" + (row.inBasePeriod ? "Sim" : "Não") + "</td>" +
        "<td>" + statusToHtml(row.status) + "</td>" +
        "<td>" + escapeHtml((row.criteria || []).join("; ")) + "</td>" +
        "</tr>";
    }).join("");
  }

  function currentChartOptions() {
    return {
      movingAverage: state.movingAverage,
      showSeries: $("show-series").checked,
      showBaseHighlight: $("show-base-highlight").checked,
      showOutsidePoints: $("show-outside-points").checked,
      title: state.limits ? state.limits.methodName : "Carta de controle de indivíduos"
    };
  }

  function renderControlChart() {
    if (!state.values.length || !state.limits) {
      return;
    }
    LabCharts.plotControlChart("control-chart", state.values, state.limits, currentChartOptions());
  }

  function saveAnalysis() {
    if (!state.limits || !state.rows.length) {
      return;
    }
    try {
      localStorage.setItem("cq_controle", JSON.stringify({
        values: state.values,
        limits: state.limits,
        movingAverage: state.movingAverage,
        rows: state.rows,
        report: state.report,
        generatedAt: new Date().toISOString()
      }));
    } catch (error) {
      // localStorage pode estar indisponível em alguns contextos locais.
    }
  }

  function analyzeData() {
    const result = LabParser.parseDataText($("data-input").value);
    const limitMethod = $("limit-method").value;
    const baseSize = Math.floor(Number($("base-size").value));
    const sigma = Number($("sigma-level").value);
    const forceZero = $("force-zero").checked;
    const showMovingAverage = $("show-moving-average").checked;
    const movingWindow = Number($("moving-average-window").value);

    state.values = result.values;
    state.limits = null;
    state.rows = [];
    state.report = "";
    state.movingAverage = [];

    renderParseMessage(result);

    if (!result.values.length) {
      return;
    }

    if (result.values.length < baseSize) {
      showMessage("danger", "O conjunto possui " + result.values.length + " dados válidos, menor que o período-base de " + baseSize + ". Reduza o período-base ou inclua mais dados.");
      return;
    }

    const limits = calculateControlLimits(result.values, baseSize, sigma, forceZero, limitMethod);
    if (limits.error) {
      showMessage("danger", limits.error);
      return;
    }

    state.limits = limits;
    state.rows = analyzeControlPoints(result.values, limits);
    state.movingAverage = showMovingAverage ? calculateMovingAverage(result.values, movingWindow) : [];
    state.report = generateControlReport(result.values, limits, state.rows);

    renderControlChart();
    renderTable(state.rows);
    $("control-report").textContent = state.report;
    saveAnalysis();
  }

  function clearData() {
    $("data-input").value = "";
    $("csv-file").value = "";
    clearMessage();
    state.values = [];
    state.limits = null;
    state.rows = [];
    state.report = "";
    state.movingAverage = [];
    $("control-chart").innerHTML = "";
    renderTable([]);
    $("control-report").textContent = "Gere a carta para criar um relatório didático.";
  }

  function downloadTable() {
    if (!state.rows.length) {
      showMessage("warning", "Gere a carta antes de baixar a tabela.");
      return;
    }
    const rows = ["indice;valor;periodo_base;situacao;criterio_usado"].concat(state.rows.map(function (row) {
      return [
        row.index,
        String(row.value).replace(".", ","),
        row.inBasePeriod ? "sim" : "nao",
        row.status.join(" | "),
        (row.criteria || []).join(" | ")
      ].join(";");
    }));
    downloadText("tabela-carta-controle.csv", rows.join("\n"));
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
        showMessage("info", "Arquivo carregado. Clique em <strong>Gerar carta</strong> para processar.");
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
    $("export-control-chart").addEventListener("click", function () {
      LabCharts.exportPlot("control-chart", "carta-controle-individuos");
    });
    $("download-table").addEventListener("click", downloadTable);
    $("copy-report").addEventListener("click", function () {
      if (!state.report) {
        showMessage("warning", "Gere a carta antes de copiar o relatório.");
        return;
      }
      copyText(state.report).then(function () {
        showMessage("success", "Relatório copiado para a área de transferência.");
      });
    });
    $("print-report").addEventListener("click", function () {
      window.print();
    });
    ["show-series", "show-base-highlight", "show-outside-points"].forEach(function (id) {
      $(id).addEventListener("change", renderControlChart);
    });
    ["show-moving-average", "moving-average-window"].forEach(function (id) {
      $(id).addEventListener("change", function () {
        state.movingAverage = $("show-moving-average").checked && state.values.length
          ? calculateMovingAverage(state.values, Number($("moving-average-window").value))
          : [];
        renderControlChart();
        saveAnalysis();
      });
    });
  });

  window.ControlLab = {
    exampleSets: exampleSets,
    calculateControlLimits: calculateControlLimits,
    calculateMovingRanges: calculateMovingRanges,
    calculateMovingAverage: calculateMovingAverage,
    detectSequences: detectSequences,
    detectTrends: detectTrends,
    analyzeControlPoints: analyzeControlPoints,
    generateControlReport: generateControlReport
  };
})();
