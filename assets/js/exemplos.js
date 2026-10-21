// Estatística Aplicada ao Controle de Qualidade — © 2026 Heraldo Antunes — Licença MIT (ver LICENSE)
(function () {
  "use strict";

  const selectedKey = "cq_selected_example";

  function toBrazilianLines(values) {
    return values.map(function (value) {
      return value.toFixed(2).replace(".", ",");
    }).join("\n");
  }

  const examples = [
    {
      id: "estavel",
      label: "1. Estável",
      title: "Processo estável",
      description: "Resultados de material de controle com pequena variação aleatória em torno da média, sem tendência clara e sem ponto fora dos limites.",
      values: [
        10.01, 9.99, 10.02, 10.00, 10.03, 9.98, 10.01, 10.04, 9.97, 10.02,
        10.00, 10.03, 9.99, 10.01, 10.02, 9.98, 10.04, 10.00, 9.99, 10.03,
        10.01, 10.02, 9.98, 10.04, 10.00, 9.97, 10.03, 10.01, 9.99, 10.02,
        10.04, 9.98, 10.00, 10.03, 10.01, 9.99, 10.02, 10.04, 9.97, 10.00,
        10.03, 10.01, 9.98, 10.02, 10.04, 9.99, 10.01, 10.03
      ]
    },
    {
      id: "ponto_fora",
      label: "2. Ponto fora",
      title: "Ponto fora de controle",
      description: "Série estável no período-base com um resultado posterior acima do limite, compatível com erro pontual de preparo, bolha, contaminação ou leitura ruim.",
      values: [
        10.00, 10.02, 9.99, 10.01, 10.03, 9.98, 10.02, 10.00, 10.01, 9.99,
        10.03, 9.98, 10.01, 10.02, 10.00, 9.99, 10.03, 10.01, 9.98, 10.02,
        10.01, 10.03, 9.99, 10.00, 10.02, 10.01, 9.98, 10.03, 10.00, 9.99,
        10.02, 10.21, 10.01, 9.99, 10.03, 10.00, 9.98, 10.02, 10.01, 10.03,
        9.99, 10.00, 10.02, 9.98, 10.01, 10.03, 10.00, 9.99
      ]
    },
    {
      id: "tendencia",
      label: "3. Tendência",
      title: "Tendência gradual",
      description: "Após período inicial estável, os resultados sobem gradualmente, simulando deriva instrumental, envelhecimento de reagente ou mudança lenta de calibração.",
      values: [
        9.99, 10.01, 10.00, 10.02, 9.98, 10.01, 10.03, 9.99, 10.00, 10.02,
        9.98, 10.01, 10.03, 10.00, 9.99, 10.02, 10.01, 9.98, 10.00, 10.02,
        10.03, 10.04, 10.05, 10.07, 10.08, 10.09, 10.11, 10.12, 10.13, 10.15,
        10.16, 10.17, 10.19, 10.20, 10.21, 10.23, 10.24, 10.25, 10.27, 10.28,
        10.29, 10.31, 10.32, 10.33, 10.35, 10.36, 10.37, 10.39
      ]
    },
    {
      id: "mudanca_patamar",
      label: "4. Patamar",
      title: "Mudança de patamar",
      description: "A primeira parte fica próxima de uma média e a segunda em patamar mais alto, simulando troca de lote, recalibração, novo padrão ou mudança operacional.",
      values: [
        9.98, 10.01, 10.00, 10.02, 9.99, 10.03, 10.01, 9.98, 10.00, 10.02,
        9.99, 10.01, 10.03, 9.98, 10.00, 10.02, 9.99, 10.01, 10.03, 10.00,
        10.10, 10.12, 10.11, 10.14, 10.09, 10.13, 10.12, 10.15, 10.10, 10.14,
        10.11, 10.13, 10.15, 10.12, 10.16, 10.11, 10.14, 10.13, 10.15, 10.12,
        10.16, 10.14, 10.13, 10.15, 10.12, 10.16, 10.14, 10.15
      ]
    },
    {
      id: "alta_dispersao",
      label: "5. Dispersão",
      title: "Aumento de dispersão",
      description: "A média permanece próxima do alvo, mas a variação aumenta após o período-base, sugerindo perda de precisão, instabilidade operacional ou piora de repetibilidade.",
      values: [
        10.00, 10.01, 9.99, 10.02, 9.98, 10.01, 10.03, 9.99, 10.00, 10.02,
        9.98, 10.01, 10.03, 10.00, 9.99, 10.02, 10.01, 9.98, 10.00, 10.02,
        9.91, 10.08, 9.94, 10.11, 9.88, 10.13, 9.96, 10.07, 9.90, 10.12,
        9.93, 10.09, 9.86, 10.15, 9.95, 10.10, 9.89, 10.14, 9.97, 10.06,
        9.92, 10.13, 9.87, 10.16, 9.94, 10.08, 9.90, 10.12
      ]
    }
  ];

  function getById(id) {
    return examples.find(function (example) {
      return example.id === id;
    }) || examples[0];
  }

  function getSelectedId() {
    try {
      return localStorage.getItem(selectedKey) || examples[0].id;
    } catch (error) {
      return examples[0].id;
    }
  }

  function setSelectedId(id) {
    try {
      localStorage.setItem(selectedKey, id);
    } catch (error) {
      // localStorage pode estar indisponível em alguns contextos locais.
    }
  }

  function setActiveButton(activeId, container) {
    if (!container) {
      return;
    }
    Array.from(container.querySelectorAll("[data-example-id]")).forEach(function (button) {
      const active = button.getAttribute("data-example-id") === activeId;
      button.classList.toggle("example-button-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function updateDescription(example) {
    const name = document.getElementById("example-name");
    const description = document.getElementById("example-description");
    if (name) {
      name.textContent = "Selecionado: " + example.title;
    }
    if (description) {
      description.textContent = example.description;
    }
  }

  function fillInput(example) {
    const input = document.getElementById("data-input");
    if (input) {
      input.value = toBrazilianLines(example.values);
    }
  }

  function renderButtons(onSelect) {
    const container = document.getElementById("example-buttons");
    if (!container) {
      return;
    }

    container.innerHTML = examples.map(function (example) {
      return '<button class="button button-secondary example-button" type="button" data-example-id="' +
        example.id + '" aria-pressed="false">' + example.label + '</button>';
    }).join("");

    container.addEventListener("click", function (event) {
      const button = event.target.closest("[data-example-id]");
      if (!button) {
        return;
      }
      const example = getById(button.getAttribute("data-example-id"));
      fillInput(example);
      updateDescription(example);
      setSelectedId(example.id);
      setActiveButton(example.id, container);
      if (typeof onSelect === "function") {
        onSelect(example);
      }
    });

    const selected = getById(getSelectedId());
    updateDescription(selected);
    setActiveButton(selected.id, container);
  }

  window.CQExamples = examples;
  window.CQExampleTools = {
    toBrazilianLines: toBrazilianLines,
    getById: getById,
    getSelectedId: getSelectedId,
    setSelectedId: setSelectedId,
    renderButtons: renderButtons
  };
})();
