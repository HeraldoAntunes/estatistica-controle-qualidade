(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readSaved(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function format(value, digits) {
    return StatsLab.formatNumber(value, digits === undefined ? 4 : digits);
  }

  function formatDate(value) {
    if (!value) {
      return "N/A";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  }

  function showMessage(type, html) {
    const element = $("report-message");
    element.className = "message message-" + type;
    element.innerHTML = html;
  }

  function statRows(stats) {
    if (!stats) {
      return "";
    }
    const modeText = stats.mode && stats.mode.length
      ? stats.mode.map(function (value) { return format(value); }).join("; ")
      : "Sem moda evidente";
    const rows = [
      ["n", stats.n],
      ["Média", format(stats.mean)],
      ["Mediana", format(stats.median)],
      ["Moda", modeText],
      ["Mínimo", format(stats.min)],
      ["Máximo", format(stats.max)],
      ["Amplitude", format(stats.range)],
      ["Q1", format(stats.q1)],
      ["Q2", format(stats.q2)],
      ["Q3", format(stats.q3)],
      ["IIQ = Q3 - Q1", format(stats.iqr)],
      ["Variância amostral", format(stats.sampleVariance)],
      ["Desvio padrão amostral", format(stats.sampleStdDev)],
      ["Coeficiente de variação", stats.coefficientOfVariation === null ? "N/A" : format(stats.coefficientOfVariation, 2) + "%"],
      ["Assimetria", format(stats.skewness)],
      ["Curtose (excesso)", format(stats.kurtosis)]
    ];

    return rows.map(function (row) {
      return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td></tr>";
    }).join("");
  }

  function paragraphList(lines) {
    return (lines || []).map(function (line) {
      return "<p>" + escapeHtml(line) + "</p>";
    }).join("");
  }

  function valuesPreview(values) {
    const data = values || [];
    const preview = data.slice(0, 20).map(function (value) {
      return format(value);
    }).join("; ");
    const suffix = data.length > 20 ? " ..." : "";
    return preview ? preview + suffix : "Nenhum dado salvo.";
  }

  function renderDescriptive(saved) {
    if (!saved) {
      return '<section class="card full-width"><p class="eyebrow">Estatística descritiva</p><h2>Sem análise salva</h2><p>Execute o módulo de estatística descritiva para preencher esta seção.</p></section>';
    }

    return [
      '<section class="card full-width report-section">',
      '<p class="eyebrow">Estatística descritiva</p>',
      '<h2>Resumo descritivo</h2>',
      '<p><strong>Gerado em:</strong> ' + formatDate(saved.generatedAt) + '</p>',
      '<div class="table-wrap"><table><thead><tr><th>Medida</th><th>Valor</th></tr></thead><tbody>',
      statRows(saved.stats),
      '</tbody></table></div>',
      '<h3>Interpretação didática</h3>',
      '<div class="interpretation-box compact-box">' + paragraphList(saved.interpretation) + '</div>',
      '</section>',
      '<section class="card full-width print-block"><h3>Histograma</h3><div id="report-desc-histogram" class="chart-box"></div></section>',
      '<section class="card full-width print-block"><h3>Boxplot</h3><div id="report-desc-boxplot" class="chart-box"></div></section>',
      '<section class="card full-width print-block"><h3>Série na ordem inserida</h3><div id="report-desc-line" class="chart-box"></div>',
      '</section>'
    ].join("");
  }

  function renderNormality(saved) {
    if (!saved) {
      return '<section class="card full-width"><p class="eyebrow">Normalidade</p><h2>Sem análise salva</h2><p>Execute o módulo de normalidade para preencher esta seção.</p></section>';
    }

    const testRows = (saved.tests || []).filter(function (test) {
      return test.pValue !== null && test.pValue !== undefined && Number.isFinite(test.pValue);
    }).map(function (test) {
      return "<tr>" +
        "<td>" + escapeHtml(test.name) + "</td>" +
        "<td>" + format(test.statistic) + "</td>" +
        "<td>" + StatsLab.formatPValue(test.pValue) + "</td>" +
        "<td>" + escapeHtml(test.note || "") + "</td>" +
        "</tr>";
    }).join("");
    const probability = saved.probability;
    const probabilityHtml = probability
      ? '<p><strong>x:</strong> ' + format(probability.x) + '; <strong>z:</strong> ' + format(probability.z) + '; <strong>P(X ≤ x):</strong> ' + StatsLab.formatPercent(probability.cumulativeProbability * 100, 2) + '</p>'
      : '<p>Nenhuma probabilidade acumulada foi calculada no módulo de normalidade.</p>';
    const probabilityChartHtml = probability
      ? '<section class="card full-width print-block"><h3>Gráfico da probabilidade acumulada</h3><div id="report-probability-chart" class="chart-box large-chart"></div></section>'
      : "";

    return [
      '<section class="card full-width report-section">',
      '<p class="eyebrow">Normalidade e curva normal</p>',
      '<h2>Testes e gráficos</h2>',
      '<p><strong>Gerado em:</strong> ' + formatDate(saved.generatedAt) + '</p>',
      '<div class="table-wrap"><table><thead><tr><th>Teste</th><th>Estatística</th><th>p-valor</th><th>Observação</th></tr></thead><tbody>',
      testRows || '<tr><td colspan="4">Sem testes salvos.</td></tr>',
      '</tbody></table></div>',
      '<h3>Interpretação</h3>',
      '<div class="interpretation-box compact-box">' + paragraphList(saved.interpretation) + '</div>',
      '</section>',
      '<section class="card full-width print-block"><h3>Histograma com curva normal</h3><div id="report-normal-chart" class="chart-box large-chart"></div></section>',
      '<section class="card full-width print-block"><h3>Q-Q plot</h3><div id="report-qq-chart" class="chart-box large-chart"></div></section>',
      '<section class="card full-width print-block"><h3>Intervalos μ ± 1σ, μ ± 2σ e μ ± 3σ</h3><div id="report-intervals-chart" class="chart-box large-chart"></div></section>',
      '<section class="card full-width report-section">',
      '<h3>Probabilidade acumulada</h3>',
      '<div class="interpretation-box compact-box">' + probabilityHtml + '</div>',
      '</section>',
      probabilityChartHtml
    ].join("");
  }

  function renderControl(saved) {
    if (!saved) {
      return '<section class="card full-width"><p class="eyebrow">Carta de controle</p><h2>Sem análise salva</h2><p>Execute o módulo de carta de controle para preencher esta seção.</p></section>';
    }

    const tableRows = (saved.rows || []).map(function (row) {
      return "<tr>" +
        "<td>" + row.index + "</td>" +
        "<td>" + format(row.value) + "</td>" +
        "<td>" + (row.inBasePeriod ? "Sim" : "Não") + "</td>" +
        "<td>" + escapeHtml((row.status || []).join("; ")) + "</td>" +
        "<td>" + escapeHtml((row.criteria || []).join("; ")) + "</td>" +
        "</tr>";
    }).join("");

    return [
      '<section class="card full-width report-section">',
      '<p class="eyebrow">Carta de controle</p>',
      '<h2>Critérios e sinais de atenção</h2>',
      '<p><strong>Gerado em:</strong> ' + formatDate(saved.generatedAt) + '</p>',
      '<pre class="report-box">' + escapeHtml(saved.report || "") + '</pre>',
      '</section>',
      '<section class="card full-width print-block"><h3>Carta de controle</h3><div id="report-control-chart" class="chart-box large-chart"></div></section>',
      '<section class="card full-width report-section">',
      '<h3>Tabela de pontos</h3>',
      '<div class="table-wrap compact-box"><table><thead><tr><th>#</th><th>Valor</th><th>Período-base</th><th>Situação</th><th>Critério usado</th></tr></thead><tbody>',
      tableRows || '<tr><td colspan="5">Sem tabela salva.</td></tr>',
      '</tbody></table></div>',
      '</section>'
    ].join("");
  }

  function resizePlots() {
    if (!window.Plotly || !Plotly.Plots) {
      return;
    }
    document.querySelectorAll(".js-plotly-plot").forEach(function (plot) {
      Plotly.Plots.resize(plot);
    });
  }

  function createPrintImages() {
    if (!window.Plotly || !Plotly.toImage) {
      return Promise.resolve();
    }
    const jobs = Array.from(document.querySelectorAll(".js-plotly-plot")).map(function (plot) {
      return Plotly.toImage(plot, {
        format: "png",
        width: 1100,
        height: 720,
        scale: 2
      }).then(function (dataUrl) {
        const wrapper = plot.closest(".chart-box");
        let image = wrapper ? wrapper.querySelector(".print-chart-image") : null;
        if (!wrapper) {
          return;
        }
        if (!image) {
          image = document.createElement("img");
          image.className = "print-chart-image";
          image.alt = "Imagem do gráfico para impressão";
          wrapper.appendChild(image);
        }
        image.src = dataUrl;
        wrapper.classList.add("print-image-ready");
      }).catch(function () {
        // Se a conversão falhar, o gráfico interativo ainda permanece visível.
      });
    });
    return Promise.all(jobs);
  }

  function refreshReportPlots() {
    window.setTimeout(function () {
      resizePlots();
      createPrintImages();
    }, 300);
  }

  function renderReport() {
    const descriptive = readSaved("cq_descritiva");
    const normality = readSaved("cq_normalidade");
    const probabilitySaved = readSaved("cq_probabilidade");
    const control = readSaved("cq_controle");
    const hasAny = descriptive || normality || control;

    if (normality && probabilitySaved && !normality.probability) {
      normality.probability = probabilitySaved.probability;
    }

    $("report-content").innerHTML = [
      '<section class="card full-width">',
      '<p class="eyebrow">Identificação</p>',
      '<h2>Relatório consolidado didático</h2>',
      '<p><strong>Material:</strong> Controle de Qualidade para a Garantia da Validade dos Resultados – IFCE, campus Limoeiro do Norte.</p>',
      '<p><strong>Gerado em:</strong> ' + formatDate(new Date().toISOString()) + '</p>',
      '<div class="notice notice-warning compact-notice"><p>Este relatório é didático. Não substitui software estatístico validado, sistema LIMS, planilha verificada, procedimento formal do laboratório ou análise crítica requerida para uso em rotina acreditada.</p></div>',
      '</section>',
      '<section class="card full-width">',
      '<p class="eyebrow">Dados analisados</p>',
      '<h2>Conjuntos salvos</h2>',
      '<p><strong>Descritiva:</strong> ' + (descriptive ? descriptive.values.length + " valores. " + valuesPreview(descriptive.values) : "sem dados salvos.") + '</p>',
      '<p><strong>Normalidade:</strong> ' + (normality ? normality.values.length + " valores. " + valuesPreview(normality.values) : "sem dados salvos.") + '</p>',
      '<p><strong>Carta de controle:</strong> ' + (control ? control.values.length + " valores. " + valuesPreview(control.values) : "sem dados salvos.") + '</p>',
      '</section>',
      renderDescriptive(descriptive),
      renderNormality(normality),
      renderControl(control),
      '<section class="card full-width">',
      '<p class="eyebrow">Interpretação geral</p>',
      '<h2>Leitura integrada</h2>',
      '<p>Use a estatística descritiva para resumir centro e dispersão, a normalidade para avaliar se aproximações baseadas em média e desvio padrão são razoáveis, e a carta de controle para visualizar comportamento temporal, tendência e sinais de atenção.</p>',
      '<p>A decisão técnica deve considerar método, calibração, branco, controle interno, matriz, histórico, critérios previamente definidos e procedimento documentado do laboratório.</p>',
      '</section>',
      '<section class="card full-width">',
      '<p class="eyebrow">Limitações</p>',
      '<h2>Uso didático</h2>',
      '<p>A ferramenta apoia o estudo do requisito 7.7 da ISO/IEC 17025, mas não comprova conformidade. Rastreabilidade, validação formal, frequência de análise, critérios de aceitação e ações diante de resultados fora dos critérios dependem do procedimento do laboratório.</p>',
      '</section>'
    ].join("");

    if (!hasAny) {
      showMessage("warning", "Nenhuma análise salva foi encontrada. Execute pelo menos um módulo antes de gerar o relatório.");
      return;
    }

    window.setTimeout(function () {
      if (descriptive && descriptive.values && descriptive.values.length) {
        LabCharts.plotHistogram("report-desc-histogram", descriptive.values, "Histograma dos dados");
        LabCharts.plotBoxplot("report-desc-boxplot", descriptive.values, "Boxplot com pontos individuais");
        LabCharts.plotLine("report-desc-line", descriptive.values, "Dados na ordem inserida");
      }
      if (normality && normality.values && normality.stats && normality.stats.sampleStdDev) {
        LabCharts.plotHistogramWithNormal("report-normal-chart", normality.values, normality.stats.mean, normality.stats.sampleStdDev);
        LabCharts.plotQQPlot("report-qq-chart", normality.values, normality.stats.mean, normality.stats.sampleStdDev);
        LabCharts.plotNormalIntervals("report-intervals-chart", normality.values, normality.stats.mean, normality.stats.sampleStdDev);
        if (normality.probability) {
          LabCharts.plotProbability("report-probability-chart", normality.values, normality.stats.mean, normality.stats.sampleStdDev, normality.probability.x);
        }
      }
      if (control && control.values && control.limits) {
        LabCharts.plotControlChart("report-control-chart", control.values, control.limits, {
          movingAverage: control.movingAverage || [],
          showSeries: true,
          showBaseHighlight: true,
          showOutsidePoints: true,
          title: control.limits.methodName || "Carta de controle de indivíduos"
        });
      }
      refreshReportPlots();
    }, 80);

    showMessage("success", "Relatório consolidado gerado com os dados salvos no navegador.");
  }

  function clearSavedReport() {
    ["cq_descritiva", "cq_normalidade", "cq_controle", "cq_probabilidade"].forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // localStorage pode estar indisponível em alguns contextos locais.
      }
    });
    $("report-content").innerHTML = '<section class="card full-width"><p class="eyebrow">Relatório</p><h2>Dados salvos removidos</h2><p>Execute novamente os módulos para gerar um novo relatório consolidado.</p></section>';
    showMessage("success", "Dados salvos removidos deste navegador.");
  }

  document.addEventListener("DOMContentLoaded", function () {
    $("generate-report").addEventListener("click", renderReport);
    $("print-report").addEventListener("click", function () {
      resizePlots();
      createPrintImages().then(function () {
        window.setTimeout(function () {
          window.print();
        }, 100);
      });
    });
    $("clear-saved-report").addEventListener("click", clearSavedReport);
    window.addEventListener("beforeprint", function () {
      resizePlots();
      createPrintImages();
    });
    window.addEventListener("afterprint", resizePlots);
  });
})();
