// Estatística Aplicada ao Controle de Qualidade — © 2026 Heraldo Antunes — Licença MIT (ver LICENSE)
(function () {
  "use strict";

  function cleanData(data) {
    return (data || []).filter(function (value) {
      return Number.isFinite(value);
    });
  }

  function sortNumbers(data) {
    return cleanData(data).slice().sort(function (a, b) {
      return a - b;
    });
  }

  function sum(data) {
    return cleanData(data).reduce(function (total, value) {
      return total + value;
    }, 0);
  }

  function mean(data) {
    const values = cleanData(data);
    return values.length ? sum(values) / values.length : null;
  }

  function median(data) {
    const sorted = sortNumbers(data);
    const n = sorted.length;
    if (!n) {
      return null;
    }
    const middle = Math.floor(n / 2);
    return n % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function quantile(data, probability) {
    const sorted = sortNumbers(data);
    const n = sorted.length;
    if (!n) {
      return null;
    }
    if (n === 1) {
      return sorted[0];
    }
    const position = (n - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    const weight = position - lower;
    return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
  }

  function mode(data) {
    const values = cleanData(data);
    const frequencies = new Map();
    let highest = 0;

    values.forEach(function (value) {
      const key = String(value);
      const next = (frequencies.get(key) || 0) + 1;
      frequencies.set(key, next);
      highest = Math.max(highest, next);
    });

    if (highest <= 1) {
      return [];
    }

    return Array.from(frequencies.entries())
      .filter(function (entry) {
        return entry[1] === highest;
      })
      .map(function (entry) {
        return Number(entry[0]);
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function sampleVariance(data) {
    const values = cleanData(data);
    const n = values.length;
    const avg = mean(values);
    if (n < 2 || avg === null) {
      return null;
    }
    const squared = values.reduce(function (total, value) {
      return total + Math.pow(value - avg, 2);
    }, 0);
    return squared / (n - 1);
  }

  function sampleStdDev(data) {
    const variance = sampleVariance(data);
    return variance === null ? null : Math.sqrt(variance);
  }

  function meanAbsoluteDeviation(data) {
    const values = cleanData(data);
    const avg = mean(values);
    if (!values.length || avg === null) {
      return null;
    }
    return values.reduce(function (total, value) {
      return total + Math.abs(value - avg);
    }, 0) / values.length;
  }

  function coefficientOfVariation(data) {
    const avg = mean(data);
    const sd = sampleStdDev(data);
    if (avg === null || sd === null || avg === 0) {
      return null;
    }
    return (sd / Math.abs(avg)) * 100;
  }

  function skewness(data) {
    const values = cleanData(data);
    const n = values.length;
    const avg = mean(values);
    const sd = sampleStdDev(values);
    if (n < 3 || avg === null || !sd) {
      return null;
    }
    const standardizedCubeSum = values.reduce(function (total, value) {
      return total + Math.pow((value - avg) / sd, 3);
    }, 0);
    return (n / ((n - 1) * (n - 2))) * standardizedCubeSum;
  }

  function kurtosis(data) {
    const values = cleanData(data);
    const n = values.length;
    const avg = mean(values);
    const sd = sampleStdDev(values);
    if (n < 4 || avg === null || !sd) {
      return null;
    }
    const standardizedFourthSum = values.reduce(function (total, value) {
      return total + Math.pow((value - avg) / sd, 4);
    }, 0);
    return (
      (n * (n + 1) * standardizedFourthSum) / ((n - 1) * (n - 2) * (n - 3)) -
      (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))
    );
  }

  function min(data) {
    const values = cleanData(data);
    return values.length ? Math.min.apply(null, values) : null;
  }

  function max(data) {
    const values = cleanData(data);
    return values.length ? Math.max.apply(null, values) : null;
  }

  function range(data) {
    const minimum = min(data);
    const maximum = max(data);
    return minimum === null || maximum === null ? null : maximum - minimum;
  }

  function quartiles(data) {
    return {
      q1: quantile(data, 0.25),
      q2: quantile(data, 0.5),
      q3: quantile(data, 0.75)
    };
  }

  function boxplotLimits(data) {
    const qs = quartiles(data);
    if (qs.q1 === null || qs.q3 === null) {
      return null;
    }
    const iqr = qs.q3 - qs.q1;
    const lower = qs.q1 - 1.5 * iqr;
    const upper = qs.q3 + 1.5 * iqr;
    const outliers = cleanData(data)
      .map(function (value, index) {
        return { index: index, value: value };
      })
      .filter(function (item) {
        return item.value < lower || item.value > upper;
      });

    return {
      q1: qs.q1,
      q2: qs.q2,
      q3: qs.q3,
      iqr: iqr,
      lower: lower,
      upper: upper,
      outliers: outliers
    };
  }

  function descriptiveStats(data) {
    const values = cleanData(data);
    const qs = quartiles(values);
    const variance = sampleVariance(values);
    const sd = sampleStdDev(values);
    const iqr = qs.q1 === null || qs.q3 === null ? null : qs.q3 - qs.q1;

    return {
      n: values.length,
      sum: sum(values),
      mean: mean(values),
      median: median(values),
      mode: mode(values),
      min: min(values),
      max: max(values),
      range: range(values),
      q1: qs.q1,
      q2: qs.q2,
      q3: qs.q3,
      iqr: iqr,
      sampleVariance: variance,
      sampleStdDev: sd,
      meanAbsoluteDeviation: meanAbsoluteDeviation(values),
      coefficientOfVariation: coefficientOfVariation(values),
      skewness: skewness(values),
      kurtosis: kurtosis(values),
      boxplot: boxplotLimits(values)
    };
  }

  function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    const absolute = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * absolute);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absolute * absolute));
    return sign * y;
  }

  function normalPdf(x, avg, sd) {
    const mu = avg === undefined ? 0 : avg;
    const sigma = sd === undefined ? 1 : sd;
    if (!sigma || sigma <= 0) {
      return null;
    }
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  }

  function normalCdf(x, avg, sd) {
    const mu = avg === undefined ? 0 : avg;
    const sigma = sd === undefined ? 1 : sd;
    if (!sigma || sigma <= 0) {
      return null;
    }
    return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
  }

  function inverseNormalCdf(p) {
    if (p <= 0 || p >= 1) {
      return NaN;
    }

    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const plow = 0.02425;
    const phigh = 1 - plow;
    let q;
    let r;

    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }

    if (p > phigh) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }

    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  function zScore(value, avg, sd) {
    if (!sd || sd <= 0) {
      return null;
    }
    return (value - avg) / sd;
  }

  function normalIntervals(avg, sd) {
    if (avg === null || sd === null) {
      return [];
    }
    return [1, 2, 3].map(function (k) {
      return {
        k: k,
        lower: avg - k * sd,
        upper: avg + k * sd,
        approximateCoverage: k === 1 ? 68 : k === 2 ? 95 : 99.7
      };
    });
  }

  function jarqueBera(data) {
    const values = cleanData(data);
    const n = values.length;
    const avg = mean(values);
    if (n < 4 || avg === null) {
      return {
        name: "Jarque-Bera",
        statistic: null,
        pValue: null,
        note: "Requer pelo menos 4 valores.",
        recommendedUse: "Mais adequado para amostras maiores; baseado em assimetria e curtose."
      };
    }

    const m2 = values.reduce(function (total, value) {
      return total + Math.pow(value - avg, 2);
    }, 0) / n;

    if (!m2) {
      return {
        name: "Jarque-Bera",
        statistic: null,
        pValue: null,
        note: "Todos os valores são iguais.",
        recommendedUse: "Mais adequado para amostras maiores; baseado em assimetria e curtose."
      };
    }

    const m3 = values.reduce(function (total, value) {
      return total + Math.pow(value - avg, 3);
    }, 0) / n;
    const m4 = values.reduce(function (total, value) {
      return total + Math.pow(value - avg, 4);
    }, 0) / n;
    const skew = m3 / Math.pow(m2, 1.5);
    const excessKurtosis = m4 / Math.pow(m2, 2) - 3;
    const statistic = (n / 6) * (Math.pow(skew, 2) + Math.pow(excessKurtosis, 2) / 4);

    // Para qui-quadrado com 2 graus de liberdade, P(Chi2 >= x) = exp(-x/2).
    return {
      name: "Jarque-Bera",
      statistic: statistic,
      pValue: Math.exp(-statistic / 2),
      note: "Teste aproximado baseado em assimetria e curtose. É mais informativo em amostras maiores.",
      recommendedUse: "Mais adequado para amostras maiores; baseado em assimetria e curtose."
    };
  }

  function andersonDarlingNormal(data) {
    const values = sortNumbers(data);
    const n = values.length;
    const avg = mean(values);
    const sd = sampleStdDev(values);

    if (n < 5) {
      return {
        name: "Anderson-Darling",
        statistic: null,
        pValue: null,
        note: "Requer pelo menos 5 valores.",
        recommendedUse: "Sensível nas caudas; útil para verificar desvios extremos."
      };
    }

    if (avg === null || !sd) {
      return {
        name: "Anderson-Darling",
        statistic: null,
        pValue: null,
        note: "Desvio padrão nulo.",
        recommendedUse: "Sensível nas caudas; útil para verificar desvios extremos."
      };
    }

    let sumLogs = 0;
    const epsilon = 1e-12;

    for (let i = 0; i < n; i += 1) {
      const lowerCdf = Math.min(Math.max(normalCdf(values[i], avg, sd), epsilon), 1 - epsilon);
      const upperCdf = Math.min(Math.max(normalCdf(values[n - 1 - i], avg, sd), epsilon), 1 - epsilon);
      sumLogs += (2 * (i + 1) - 1) * (Math.log(lowerCdf) + Math.log(1 - upperCdf));
    }

    const statistic = -n - sumLogs / n;
    const adjusted = statistic * (1 + 0.75 / n + 2.25 / (n * n));
    let pValue;

    if (adjusted < 0.2) {
      pValue = 1 - Math.exp(-13.436 + 101.14 * adjusted - 223.73 * adjusted * adjusted);
    } else if (adjusted < 0.34) {
      pValue = 1 - Math.exp(-8.318 + 42.796 * adjusted - 59.938 * adjusted * adjusted);
    } else if (adjusted < 0.6) {
      pValue = Math.exp(0.9177 - 4.279 * adjusted - 1.38 * adjusted * adjusted);
    } else if (adjusted < 13) {
      pValue = Math.exp(1.2937 - 5.709 * adjusted + 0.0186 * adjusted * adjusted);
    } else {
      pValue = 0;
    }

    return {
      name: "Anderson-Darling",
      statistic: adjusted,
      pValue: Math.min(Math.max(pValue, 0), 1),
      note: "p-valor aproximado para normalidade com média e desvio estimados; dá mais peso às caudas.",
      recommendedUse: "Sensível nas caudas; útil para verificar desvios extremos."
    };
  }

  function shapiroWilkNormal(data) {
    const n = cleanData(data).length;
    return {
      name: "Shapiro-Wilk",
      statistic: null,
      pValue: null,
      available: false,
      note: n < 3
        ? "Não aplicado: o teste requer pelo menos 3 valores."
        : "Não calculado nesta versão. O p-valor confiável depende de algoritmo validado, como Royston/AS 181; sem biblioteca local auditada, a ferramenta não exibe um resultado potencialmente incorreto.",
      recommendedUse: "Preferencial para amostras pequenas e moderadas quando implementado com p-valor confiável."
    };
  }

  function lillieforsStatistic(values) {
    const sorted = sortNumbers(values);
    const n = sorted.length;
    const avg = mean(sorted);
    const sd = sampleStdDev(sorted);
    let dPlus = 0;
    let dMinus = 0;

    if (n < 5 || avg === null || !sd) {
      return null;
    }

    sorted.forEach(function (value, index) {
      const cdf = normalCdf(value, avg, sd);
      const empiricalUpper = (index + 1) / n;
      const empiricalLower = index / n;
      dPlus = Math.max(dPlus, empiricalUpper - cdf);
      dMinus = Math.max(dMinus, cdf - empiricalLower);
    });

    return Math.max(dPlus, dMinus);
  }

  function seededRandom(seed) {
    let state = seed % 2147483647;
    if (state <= 0) {
      state += 2147483646;
    }
    return function () {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  function randomNormal(rng) {
    const u1 = Math.max(rng(), 1e-12);
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function lillieforsNormal(data) {
    const values = cleanData(data);
    const n = values.length;
    const observed = lillieforsStatistic(values);

    if (n < 5) {
      return {
        name: "Lilliefors",
        statistic: null,
        pValue: null,
        note: "Requer pelo menos 5 valores.",
        recommendedUse: "Alternativa ao KS quando média e desvio padrão são estimados da própria amostra."
      };
    }

    if (observed === null) {
      return {
        name: "Lilliefors",
        statistic: null,
        pValue: null,
        note: "Não calculado por desvio padrão nulo ou dados insuficientes.",
        recommendedUse: "Alternativa ao KS quando média e desvio padrão são estimados da própria amostra."
      };
    }

    const simulations = n <= 100 ? 2500 : n <= 500 ? 1500 : 800;
    const rng = seededRandom(123457 + n * 97);
    let extremeCount = 0;

    for (let i = 0; i < simulations; i += 1) {
      const simulated = [];
      for (let j = 0; j < n; j += 1) {
        simulated.push(randomNormal(rng));
      }
      if (lillieforsStatistic(simulated) >= observed) {
        extremeCount += 1;
      }
    }

    return {
      name: "Lilliefors",
      statistic: observed,
      pValue: (extremeCount + 1) / (simulations + 1),
      note: "Versão de Kolmogorov-Smirnov com média e desvio estimados; p-valor aproximado por simulação determinística.",
      recommendedUse: "Alternativa ao KS quando média e desvio padrão são estimados da própria amostra."
    };
  }

  function populationMoment(values, order, avg) {
    return values.reduce(function (total, value) {
      return total + Math.pow(value - avg, order);
    }, 0) / values.length;
  }

  function dagostinoPearson(data) {
    const values = cleanData(data);
    const n = values.length;
    const avg = mean(values);

    if (n < 8 || avg === null) {
      return {
        name: "D'Agostino-Pearson",
        statistic: null,
        pValue: null,
        note: "Requer pelo menos 8 valores; tende a ser mais útil em amostras moderadas a grandes.",
        recommendedUse: "Bom apoio em amostras moderadas a grandes; combina assimetria e curtose."
      };
    }

    const m2 = populationMoment(values, 2, avg);
    if (!m2) {
      return {
        name: "D'Agostino-Pearson",
        statistic: null,
        pValue: null,
        note: "Todos os valores são iguais.",
        recommendedUse: "Bom apoio em amostras moderadas a grandes; combina assimetria e curtose."
      };
    }

    const m3 = populationMoment(values, 3, avg);
    const m4 = populationMoment(values, 4, avg);
    const g1 = m3 / Math.pow(m2, 1.5);
    const b2 = m4 / Math.pow(m2, 2);

    const y = g1 * Math.sqrt(((n + 1) * (n + 3)) / (6 * (n - 2)));
    const beta2 = (3 * (n * n + 27 * n - 70) * (n + 1) * (n + 3)) /
      ((n - 2) * (n + 5) * (n + 7) * (n + 9));
    const w2 = -1 + Math.sqrt(2 * (beta2 - 1));
    const delta = 1 / Math.sqrt(Math.log(Math.sqrt(w2)));
    const alpha = Math.sqrt(2 / (w2 - 1));
    const skewZ = delta * Math.log((y / alpha) + Math.sqrt(Math.pow(y / alpha, 2) + 1));

    const expectedKurtosis = (3 * (n - 1)) / (n + 1);
    const varianceKurtosis = (24 * n * (n - 2) * (n - 3)) /
      (Math.pow(n + 1, 2) * (n + 3) * (n + 5));
    const x = (b2 - expectedKurtosis) / Math.sqrt(varianceKurtosis);
    const sqrtBeta1 = (6 * (n * n - 5 * n + 2) / ((n + 7) * (n + 9))) *
      Math.sqrt((6 * (n + 3) * (n + 5)) / (n * (n - 2) * (n - 3)));
    const a = 6 + (8 / sqrtBeta1) * ((2 / sqrtBeta1) + Math.sqrt(1 + 4 / Math.pow(sqrtBeta1, 2)));
    const denominator = 1 + x * Math.sqrt(2 / (a - 4));

    if (!Number.isFinite(skewZ) || !Number.isFinite(denominator) || denominator === 0) {
      return {
        name: "D'Agostino-Pearson",
        statistic: null,
        pValue: null,
        note: "Não foi possível calcular a transformação de assimetria e curtose para este conjunto.",
        recommendedUse: "Bom apoio em amostras moderadas a grandes; combina assimetria e curtose."
      };
    }

    const transformed = Math.sign(denominator) *
      Math.pow((1 - 2 / a) / Math.abs(denominator), 1 / 3);
    const kurtosisZ = (1 - 2 / (9 * a) - transformed) / Math.sqrt(2 / (9 * a));
    const statistic = Math.pow(skewZ, 2) + Math.pow(kurtosisZ, 2);

    return {
      name: "D'Agostino-Pearson",
      statistic: statistic,
      pValue: Math.exp(-statistic / 2),
      note: n < 20
        ? "Omnibus aproximado combinando assimetria e curtose; com n < 20, use apenas como apoio didático."
        : "Omnibus aproximado combinando assimetria e curtose.",
      recommendedUse: "Bom apoio em amostras moderadas a grandes; combina assimetria e curtose."
    };
  }

  function normalitySampleGuidance(n) {
    if (n < 8) {
      return "Com n < 8, testes formais são frágeis; priorize inspeção dos dados, histograma e Q-Q plot com cautela.";
    }
    if (n < 30) {
      return "Com 8 ≤ n < 30, Shapiro-Wilk seria preferencial se houvesse implementação validada; use Anderson-Darling e Q-Q plot como apoio.";
    }
    if (n < 50) {
      return "Com 30 ≤ n < 50, combine Anderson-Darling, Lilliefors aproximado e avaliação gráfica; Shapiro-Wilk continuaria útil se disponível.";
    }
    return "Com n ≥ 50, inclua Jarque-Bera, Lilliefors e D'Agostino-Pearson como apoio, sempre junto do histograma e do Q-Q plot.";
  }

  function average(values) {
    const clean = values.filter(function (value) {
      return Number.isFinite(value);
    });
    return clean.length ? clean.reduce(function (total, value) {
      return total + value;
    }, 0) / clean.length : null;
  }

  function qqPlotDiagnostics(data) {
    const sorted = sortNumbers(data);
    const n = sorted.length;
    const avg = mean(sorted);
    const sd = sampleStdDev(sorted);

    if (n < 5 || avg === null || !sd) {
      return {
        lines: ["A leitura automática do Q-Q plot requer pelo menos 5 valores e desvio padrão diferente de zero."]
      };
    }

    const residuals = sorted.map(function (value, index) {
      const theoretical = inverseNormalCdf((index + 0.5) / n);
      const expected = avg + sd * theoretical;
      return (value - expected) / sd;
    });
    const absResiduals = residuals.map(Math.abs);
    const maxAbs = Math.max.apply(null, absResiduals);
    const sliceSize = Math.max(2, Math.floor(n * 0.2));
    const lowerMean = average(residuals.slice(0, sliceSize));
    const upperMean = average(residuals.slice(n - sliceSize));
    const centerAbs = average(absResiduals.slice(sliceSize, n - sliceSize)) || 0;
    const tailAbs = average(absResiduals.slice(0, sliceSize).concat(absResiduals.slice(n - sliceSize))) || 0;
    const lines = [];

    if (maxAbs > 1.25) {
      lines.push("Há ponto(s) com afastamento relevante da linha de referência; verifique possíveis outliers ou caudas mais pesadas.");
    }

    if (Math.abs(upperMean - lowerMean) > 0.75) {
      lines.push("As extremidades se afastam em sentidos diferentes, o que pode sugerir curvatura sistemática ou assimetria.");
    }

    if (tailAbs > Math.max(0.45, centerAbs * 1.6)) {
      lines.push("Os desvios parecem mais fortes nas extremidades, sugerindo atenção às caudas da distribuição.");
    }

    if (!lines.length) {
      lines.push("Os pontos parecem acompanhar razoavelmente a linha de referência, sem afastamento automático marcante.");
    }

    lines.push("Essa leitura é apenas um apoio visual; o Q-Q plot não prova normalidade.");
    return {
      maxStandardizedResidual: maxAbs,
      tailMeanAbsoluteResidual: tailAbs,
      centerMeanAbsoluteResidual: centerAbs,
      lines: lines
    };
  }

  function normalityTests(data) {
    return [
      andersonDarlingNormal(data),
      jarqueBera(data),
      lillieforsNormal(data),
      dagostinoPearson(data)
    ];
  }

  function formatNumber(value, digits) {
    const maximumFractionDigits = digits === undefined ? 4 : digits;
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "N/A";
    }
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: maximumFractionDigits
    }).format(value);
  }

  function formatPValue(value) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "N/A";
    }
    if (value < 0.0001) {
      return "< 0,0001";
    }
    return formatNumber(value, 4);
  }

  function formatPercent(value, digits) {
    return formatNumber(value, digits === undefined ? 1 : digits) + "%";
  }

  window.StatsLab = {
    cleanData: cleanData,
    sortNumbers: sortNumbers,
    sum: sum,
    mean: mean,
    median: median,
    mode: mode,
    min: min,
    max: max,
    range: range,
    quantile: quantile,
    quartiles: quartiles,
    sampleVariance: sampleVariance,
    sampleStdDev: sampleStdDev,
    meanAbsoluteDeviation: meanAbsoluteDeviation,
    coefficientOfVariation: coefficientOfVariation,
    skewness: skewness,
    kurtosis: kurtosis,
    descriptiveStats: descriptiveStats,
    boxplotLimits: boxplotLimits,
    normalPdf: normalPdf,
    normalCdf: normalCdf,
    inverseNormalCdf: inverseNormalCdf,
    zScore: zScore,
    normalIntervals: normalIntervals,
    shapiroWilkNormal: shapiroWilkNormal,
    jarqueBera: jarqueBera,
    andersonDarlingNormal: andersonDarlingNormal,
    lillieforsNormal: lillieforsNormal,
    dagostinoPearson: dagostinoPearson,
    normalityTests: normalityTests,
    normalitySampleGuidance: normalitySampleGuidance,
    qqPlotDiagnostics: qqPlotDiagnostics,
    formatNumber: formatNumber,
    formatPValue: formatPValue,
    formatPercent: formatPercent
  };
})();
