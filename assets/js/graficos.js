// Estatística Aplicada ao Controle de Qualidade — © 2026 Heraldo Antunes — Licença MIT (ver LICENSE)
(function () {
  "use strict";

  const chartConfig = {
    responsive: true,
    displaylogo: false,
    toImageButtonOptions: {
      format: "png",
      filename: "grafico-estatistica-controle-qualidade",
      height: 720,
      width: 1100,
      scale: 2
    }
  };

  function canPlot(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      return false;
    }
    if (!window.Plotly) {
      element.innerHTML = '<div class="message-warning">Plotly.js não foi carregado. Verifique a conexão com a CDN ou use uma cópia local da biblioteca.</div>';
      return false;
    }
    return true;
  }

  function sequence(length) {
    return Array.from({ length: length }, function (_, index) {
      return index + 1;
    });
  }

  function baseLayout(title, xTitle, yTitle) {
    return {
      title: { text: title, font: { size: 17 } },
      margin: { t: 56, r: 24, b: 58, l: 62 },
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
      xaxis: { title: xTitle, zeroline: false, gridcolor: "#e5edf6" },
      yaxis: { title: yTitle, zeroline: false, gridcolor: "#e5edf6" },
      legend: { orientation: "h", y: -0.25 },
      font: { family: "Arial, Helvetica, sans-serif", color: "#172033" }
    };
  }

  function plotHistogram(elementId, data, title) {
    if (!canPlot(elementId)) {
      return;
    }
    const trace = {
      x: data,
      type: "histogram",
      marker: { color: "#1d4f91", line: { color: "#ffffff", width: 1 } },
      opacity: 0.88,
      name: "Frequência"
    };
    const layout = baseLayout(title || "Histograma", "Valor", "Frequência");
    Plotly.newPlot(elementId, [trace], layout, chartConfig);
  }

  function plotBoxplot(elementId, data, title) {
    if (!canPlot(elementId)) {
      return;
    }
    const trace = {
      y: data,
      type: "box",
      name: "Dados",
      boxpoints: "all",
      jitter: 0.32,
      pointpos: 0,
      marker: { color: "#0f766e", outliercolor: "#b91c1c", size: 7 },
      line: { color: "#0f766e" }
    };
    const layout = baseLayout(title || "Boxplot", "", "Valor");
    layout.xaxis.showticklabels = false;
    Plotly.newPlot(elementId, [trace], layout, chartConfig);
  }

  function plotLine(elementId, data, title) {
    if (!canPlot(elementId)) {
      return;
    }
    const trace = {
      x: sequence(data.length),
      y: data,
      type: "scatter",
      mode: "lines+markers",
      name: "Valor",
      line: { color: "#1d4f91", width: 2 },
      marker: { color: "#1d4f91", size: 7 }
    };
    const layout = baseLayout(title || "Dados na ordem inserida", "Índice", "Valor");
    Plotly.newPlot(elementId, [trace], layout, chartConfig);
  }

  function plotHistogramWithNormal(elementId, data, avg, sd) {
    if (!canPlot(elementId)) {
      return;
    }
    const minimum = StatsLab.min(data);
    const maximum = StatsLab.max(data);
    const spread = maximum - minimum || Math.abs(maximum) || 1;
    const start = minimum - spread * 0.15;
    const end = maximum + spread * 0.15;
    const steps = 140;
    const xCurve = [];
    const yCurve = [];

    for (let i = 0; i <= steps; i += 1) {
      const x = start + ((end - start) * i) / steps;
      xCurve.push(x);
      yCurve.push(StatsLab.normalPdf(x, avg, sd));
    }

    const histogram = {
      x: data,
      type: "histogram",
      histnorm: "probability density",
      marker: { color: "#1d4f91", line: { color: "#ffffff", width: 1 } },
      opacity: 0.75,
      name: "Dados"
    };
    const curve = {
      x: xCurve,
      y: yCurve,
      type: "scatter",
      mode: "lines",
      line: { color: "#b91c1c", width: 3 },
      name: "Normal ajustada"
    };
    const layout = baseLayout("Histograma com curva normal ajustada", "Valor", "Densidade");
    Plotly.newPlot(elementId, [histogram, curve], layout, chartConfig);
  }

  function plotQQPlot(elementId, data, avg, sd) {
    if (!canPlot(elementId)) {
      return;
    }
    const sorted = StatsLab.sortNumbers(data);
    const n = sorted.length;
    const theoretical = sorted.map(function (_, index) {
      return StatsLab.inverseNormalCdf((index + 0.5) / n);
    });
    const referenceX = [StatsLab.min(theoretical), StatsLab.max(theoretical)];
    const referenceY = referenceX.map(function (value) {
      return avg + sd * value;
    });
    const points = {
      x: theoretical,
      y: sorted,
      type: "scatter",
      mode: "markers",
      name: "Dados ordenados",
      marker: { color: "#1d4f91", size: 7 }
    };
    const line = {
      x: referenceX,
      y: referenceY,
      type: "scatter",
      mode: "lines",
      name: "Referência normal",
      line: { color: "#b91c1c", width: 2, dash: "dash" }
    };
    const layout = baseLayout("Q-Q plot normal", "Quantis teóricos normais", "Quantis observados");
    Plotly.newPlot(elementId, [points, line], layout, chartConfig);
  }

  function normalCurvePoints(data, avg, sd) {
    const minimum = StatsLab.min(data);
    const maximum = StatsLab.max(data);
    const spread = Math.max(maximum - minimum, sd * 6, Math.abs(maximum) * 0.2, 1);
    const start = Math.min(minimum, avg - 3.4 * sd) - spread * 0.04;
    const end = Math.max(maximum, avg + 3.4 * sd) + spread * 0.04;
    const steps = 180;
    const xCurve = [];
    const yCurve = [];

    for (let i = 0; i <= steps; i += 1) {
      const x = start + ((end - start) * i) / steps;
      xCurve.push(x);
      yCurve.push(StatsLab.normalPdf(x, avg, sd));
    }

    return { x: xCurve, y: yCurve };
  }

  function plotNormalIntervals(elementId, data, avg, sd) {
    if (!canPlot(elementId)) {
      return;
    }
    if (!sd || sd <= 0) {
      document.getElementById(elementId).innerHTML = '<div class="message-warning">Não é possível gerar o gráfico dos intervalos com desvio padrão nulo.</div>';
      return;
    }

    const curve = normalCurvePoints(data, avg, sd);
    const maxY = Math.max.apply(null, curve.y);
    const dataTrace = {
      x: data,
      y: data.map(function (_, index) {
        return maxY * (0.035 + (index % 4) * 0.018);
      }),
      type: "scatter",
      mode: "markers",
      name: "Dados observados",
      marker: { color: "#172033", size: 7, opacity: 0.72 }
    };
    const curveTrace = {
      x: curve.x,
      y: curve.y,
      type: "scatter",
      mode: "lines",
      name: "Normal ajustada",
      line: { color: "#1d4f91", width: 3 }
    };
    const meanTrace = {
      x: [avg, avg],
      y: [0, maxY * 1.1],
      type: "scatter",
      mode: "lines",
      name: "Média",
      line: { color: "#172033", width: 2 }
    };
    const layout = baseLayout("Visualização dos intervalos μ ± 1σ, μ ± 2σ e μ ± 3σ", "Valor", "Densidade");

    layout.shapes = [
      { type: "rect", xref: "x", yref: "paper", x0: avg - 3 * sd, x1: avg + 3 * sd, y0: 0, y1: 1, fillcolor: "rgba(15, 118, 110, 0.08)", line: { width: 0 }, layer: "below" },
      { type: "rect", xref: "x", yref: "paper", x0: avg - 2 * sd, x1: avg + 2 * sd, y0: 0, y1: 1, fillcolor: "rgba(29, 79, 145, 0.10)", line: { width: 0 }, layer: "below" },
      { type: "rect", xref: "x", yref: "paper", x0: avg - sd, x1: avg + sd, y0: 0, y1: 1, fillcolor: "rgba(245, 158, 11, 0.16)", line: { width: 0 }, layer: "below" }
    ];
    layout.annotations = [
      { x: avg, y: 1.04, xref: "x", yref: "paper", text: "média", showarrow: false, font: { color: "#172033", size: 12 } },
      { x: avg + sd, y: 0.86, xref: "x", yref: "paper", text: "±1σ", showarrow: false, font: { color: "#92400e", size: 12 } },
      { x: avg + 2 * sd, y: 0.74, xref: "x", yref: "paper", text: "±2σ", showarrow: false, font: { color: "#1d4f91", size: 12 } },
      { x: avg + 3 * sd, y: 0.62, xref: "x", yref: "paper", text: "±3σ", showarrow: false, font: { color: "#0f766e", size: 12 } }
    ];

    Plotly.newPlot(elementId, [curveTrace, meanTrace, dataTrace], layout, chartConfig);
  }

  function plotProbability(elementId, data, avg, sd, xValue) {
    if (!canPlot(elementId)) {
      return;
    }
    if (!sd || sd <= 0 || !Number.isFinite(xValue)) {
      document.getElementById(elementId).innerHTML = '<div class="message-warning">Analise os dados e informe um valor x válido para gerar o gráfico.</div>';
      return;
    }

    const curve = normalCurvePoints(data.concat([xValue]), avg, sd);
    const shadedX = [];
    const shadedY = [];
    curve.x.forEach(function (value, index) {
      if (value <= xValue) {
        shadedX.push(value);
        shadedY.push(curve.y[index]);
      }
    });
    if (shadedX[shadedX.length - 1] < xValue) {
      shadedX.push(xValue);
      shadedY.push(StatsLab.normalPdf(xValue, avg, sd));
    }

    const maxY = Math.max.apply(null, curve.y);
    const probability = StatsLab.normalCdf(xValue, avg, sd);
    const z = StatsLab.zScore(xValue, avg, sd);
    const areaTrace = {
      x: shadedX,
      y: shadedY,
      type: "scatter",
      mode: "lines",
      fill: "tozeroy",
      name: "P(X ≤ x)",
      line: { color: "#0f766e", width: 1 },
      fillcolor: "rgba(15, 118, 110, 0.24)"
    };
    const curveTrace = {
      x: curve.x,
      y: curve.y,
      type: "scatter",
      mode: "lines",
      name: "Normal ajustada",
      line: { color: "#1d4f91", width: 3 }
    };
    const xTrace = {
      x: [xValue, xValue],
      y: [0, maxY * 1.08],
      type: "scatter",
      mode: "lines",
      name: "x",
      line: { color: "#b91c1c", width: 2, dash: "dash" }
    };
    const meanTrace = {
      x: [avg, avg],
      y: [0, maxY * 1.08],
      type: "scatter",
      mode: "lines",
      name: "Média",
      line: { color: "#172033", width: 2 }
    };
    const layout = baseLayout("Probabilidade acumulada até x", "Valor", "Densidade");
    layout.annotations = [
      {
        x: xValue,
        y: 1.03,
        xref: "x",
        yref: "paper",
        text: "x = " + StatsLab.formatNumber(xValue, 4) + " | z = " + StatsLab.formatNumber(z, 4) + " | P = " + StatsLab.formatPercent(probability * 100, 2),
        showarrow: false,
        font: { color: "#b91c1c", size: 12 }
      }
    ];

    Plotly.newPlot(elementId, [areaTrace, curveTrace, meanTrace, xTrace], layout, chartConfig);
  }

  function plotControlChart(elementId, values, limits, options) {
    if (!canPlot(elementId)) {
      return;
    }
    const settings = options || {};
    const showSeries = settings.showSeries !== false;
    const showOutsidePoints = settings.showOutsidePoints !== false;
    const showBaseHighlight = settings.showBaseHighlight !== false;
    const x = sequence(values.length);
    const outside = values.map(function (value) {
      return value > limits.ucl || value < limits.lcl;
    });

    function subset(predicate) {
      const xs = [];
      const ys = [];
      values.forEach(function (value, index) {
        if (predicate(value, index)) {
          xs.push(index + 1);
          ys.push(value);
        }
      });
      return { x: xs, y: ys };
    }

    const base = subset(function (_, index) {
      return index < limits.baseSize && (!outside[index] || !showOutsidePoints);
    });
    const monitoring = subset(function (_, index) {
      return index >= limits.baseSize && (!outside[index] || !showOutsidePoints);
    });
    const outsidePoints = subset(function (_, index) {
      return outside[index];
    });

    const traces = [];

    if (showSeries) {
      traces.push({
        x: x,
        y: values,
        type: "scatter",
        mode: "lines",
        name: "Série temporal",
        line: { color: "#94a3b8", width: 2 }
      });
    }

    traces.push({
      x: base.x,
      y: base.y,
      type: "scatter",
      mode: "markers",
      name: "Período-base",
      marker: { color: "#1d4f91", size: 8 }
    });

    traces.push({
      x: monitoring.x,
      y: monitoring.y,
      type: "scatter",
      mode: "markers",
      name: "Após período-base",
      marker: { color: "#0f766e", size: 8, symbol: "circle-open" }
    });

    if (showOutsidePoints) {
      traces.push({
        x: outsidePoints.x,
        y: outsidePoints.y,
        type: "scatter",
        mode: "markers",
        name: "Fora dos limites",
        marker: { color: "#b91c1c", size: 11, symbol: "diamond" }
      });
    }

    traces.push({
      x: [1, values.length],
      y: [limits.center, limits.center],
      type: "scatter",
      mode: "lines",
      name: "Linha central",
      line: { color: "#172033", width: 2 }
    });

    traces.push({
      x: [1, values.length],
      y: [limits.ucl, limits.ucl],
      type: "scatter",
      mode: "lines",
      name: "LSC",
      line: { color: "#b91c1c", width: 2, dash: "dash" }
    });

    traces.push({
      x: [1, values.length],
      y: [limits.lcl, limits.lcl],
      type: "scatter",
      mode: "lines",
      name: "LIC",
      line: { color: "#b91c1c", width: 2, dash: "dash" }
    });

    if (settings.movingAverage && settings.movingAverage.length) {
      traces.push({
        x: x,
        y: settings.movingAverage,
        type: "scatter",
        mode: "lines+markers",
        name: "Média móvel",
        line: { color: "#f59e0b", width: 2 },
        marker: { color: "#f59e0b", size: 5 }
      });
    }

    const layout = baseLayout(settings.title || "Carta de controle de indivíduos", "Índice temporal", "Valor");
    layout.shapes = [];
    layout.annotations = [];

    if (showBaseHighlight) {
      layout.shapes.push({
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: 0.5,
        x1: limits.baseSize + 0.5,
        y0: 0,
        y1: 1,
        fillcolor: "rgba(29, 79, 145, 0.08)",
        line: { width: 0 },
        layer: "below"
      });
      layout.annotations.push({
        x: Math.max(1, limits.baseSize / 2),
        y: 1.04,
        xref: "x",
        yref: "paper",
        text: "período-base",
        showarrow: false,
        font: { color: "#1d4f91", size: 12 }
      });
    }

    Plotly.newPlot(elementId, traces, layout, chartConfig);
  }

  function exportPlot(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!window.Plotly || !element || !element.data) {
      return Promise.resolve(false);
    }
    return Plotly.downloadImage(elementId, {
      format: "png",
      filename: filename || "grafico-estatistica-controle-qualidade",
      height: 720,
      width: 1100,
      scale: 2
    });
  }

  function exportMultiplePlots(plots) {
    const items = (plots || []).filter(function (plot) {
      return plot && plot.elementId;
    });

    return items.reduce(function (chain, plot, index) {
      return chain.then(function () {
        return exportPlot(plot.elementId, plot.filename).then(function () {
          if (index === items.length - 1) {
            return true;
          }
          return new Promise(function (resolve) {
            window.setTimeout(resolve, 500);
          });
        });
      });
    }, Promise.resolve());
  }

  window.LabCharts = {
    plotHistogram: plotHistogram,
    plotBoxplot: plotBoxplot,
    plotLine: plotLine,
    plotHistogramWithNormal: plotHistogramWithNormal,
    plotQQPlot: plotQQPlot,
    plotNormalIntervals: plotNormalIntervals,
    plotProbability: plotProbability,
    plotControlChart: plotControlChart,
    exportPlot: exportPlot,
    exportMultiplePlots: exportMultiplePlots
  };
})();
