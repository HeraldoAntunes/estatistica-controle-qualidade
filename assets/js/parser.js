// Estatística Aplicada ao Controle de Qualidade — © 2026 Heraldo Antunes — Licença MIT (ver LICENSE)
(function () {
  "use strict";

  function normalizeText(text) {
    return String(text || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n")
      .replace(/\u00A0/g, " ")
      .trim();
  }

  function stripOuterQuotes(value) {
    const trimmed = String(value || "").trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1).trim();
    }
    return trimmed;
  }

  function countChar(text, char) {
    return String(text).split(char).length - 1;
  }

  function convertBrazilianNumber(rawValue) {
    let value = stripOuterQuotes(rawValue)
      .replace(/\u2212/g, "-")
      .replace(/\s+/g, "");

    if (!value) {
      return null;
    }

    // Aceita apenas sinais, algarismos e separadores decimais/de milhar usuais.
    if (!/^[+-]?\d[\d.,]*$/.test(value)) {
      return null;
    }

    const commaCount = countChar(value, ",");
    const dotCount = countChar(value, ".");
    let normalized = value;

    if (commaCount > 0 && dotCount > 0) {
      const lastComma = value.lastIndexOf(",");
      const lastDot = value.lastIndexOf(".");
      const decimalSeparator = lastComma > lastDot ? "," : ".";
      const thousandSeparator = decimalSeparator === "," ? "." : ",";
      normalized = value.split(thousandSeparator).join("");
      normalized = normalized.replace(decimalSeparator, ".");
    } else if (commaCount > 0) {
      if (commaCount === 1) {
        normalized = value.replace(",", ".");
      } else {
        const parts = value.split(",");
        const looksLikeThousands = parts.slice(1).every(function (part) {
          return part.length === 3;
        });
        normalized = looksLikeThousands ? parts.join("") : null;
      }
    } else if (dotCount > 1) {
      const parts = value.split(".");
      const looksLikeThousands = parts.slice(1).every(function (part) {
        return part.length === 3;
      });
      normalized = looksLikeThousands ? parts.join("") : null;
    }

    if (!normalized || !/^[+-]?(?:\d+|\d+\.\d+)$/.test(normalized)) {
      return null;
    }

    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function addInvalid(raw, invalids) {
    const cleaned = stripOuterQuotes(raw).trim();
    if (cleaned) {
      invalids.push({ raw: cleaned, reason: "valor não numérico" });
    }
  }

  function addValid(raw, value, values, invalids, items) {
    if (value === null) {
      addInvalid(raw, invalids);
      return;
    }
    values.push(value);
    items.push({ raw: stripOuterQuotes(raw).trim(), value: value });
  }

  function collectInvalidGap(gap, invalids) {
    const cleaned = String(gap || "").replace(/[;,\t]/g, " ").trim();
    if (!cleaned) {
      return;
    }
    cleaned.split(/\s+/).forEach(function (fragment) {
      if (fragment) {
        addInvalid(fragment, invalids);
      }
    });
  }

  function extractNumberLikeTokens(segment, values, invalids, items) {
    const pattern = /[-+]?(?:(?:\d{1,3}(?:\.\d{3})+,\d+)|(?:\d{1,3}(?:,\d{3})+\.\d+)|(?:\d+[,.]\d+)|(?:\d+))/g;
    let match;
    let lastIndex = 0;
    let found = false;

    while ((match = pattern.exec(segment)) !== null) {
      found = true;
      collectInvalidGap(segment.slice(lastIndex, match.index), invalids);
      addValid(match[0], convertBrazilianNumber(match[0]), values, invalids, items);
      lastIndex = match.index + match[0].length;
    }

    collectInvalidGap(segment.slice(lastIndex), invalids);
    return found;
  }

  function processSegment(segment, values, invalids, items) {
    const cleaned = stripOuterQuotes(segment).trim();
    if (!cleaned) {
      return;
    }

    const direct = convertBrazilianNumber(cleaned);
    if (direct !== null) {
      addValid(cleaned, direct, values, invalids, items);
      return;
    }

    // Quando há vírgulas ambíguas, tenta extrair números preservando vírgula decimal.
    // Ex.: "10,2,10,3" vira 10,2 e 10,3, em vez de 10, 2, 10 e 3.
    if (cleaned.includes(",")) {
      if (extractNumberLikeTokens(cleaned, values, invalids, items)) {
        return;
      }
    }

    addInvalid(cleaned, invalids);
  }

  function parseDataText(text) {
    const normalized = normalizeText(text);
    const values = [];
    const invalids = [];
    const items = [];

    if (!normalized) {
      return { values: values, invalids: invalids, items: items };
    }

    normalized.split("\n").forEach(function (row) {
      const trimmedRow = row.trim();
      if (!trimmedRow) {
        return;
      }

      let segments;
      if (/[;\t]/.test(trimmedRow)) {
        segments = trimmedRow.split(/[;\t]+/);
      } else if (/\s+/.test(trimmedRow)) {
        segments = trimmedRow.split(/\s+/);
      } else {
        segments = [trimmedRow];
      }

      segments.forEach(function (segment) {
        processSegment(segment, values, invalids, items);
      });
    });

    return { values: values, invalids: invalids, items: items };
  }

  function parseCSVText(text) {
    return parseDataText(text);
  }

  window.LabParser = {
    normalizeText: normalizeText,
    convertBrazilianNumber: convertBrazilianNumber,
    parseDataText: parseDataText,
    parseCSVText: parseCSVText
  };
})();
