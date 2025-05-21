let currentLang = "en";
let history = [];

const messages = {
  en: {
    invalid: "❌ Invalid format. Try something like 3d6kh2, 4d8kl1, 5d10u, 6d6k1",
    original: "Original Rolls",
    keepHigh: "🎲 Keep highest",
    keepLow: "🎲 Keep lowest",
    unique: "🎲 Reroll until all values are unique",
    rerollOnce: "🎲 Reroll duplicates once and keep the result",
    standard: "🎲 Standard roll",
    final: "Final Rolls",
    total: "🎯 Total",
    history: "History"
  },
  es: {
    invalid: "❌ Formato inválido. Prueba algo como 3d6kh2, 4d8kl1, 5d10u, 6d6k1",
    original: "Tiradas Originales",
    keepHigh: "🎲 Conservar los mayores",
    keepLow: "🎲 Conservar los menores",
    unique: "🎲 Repetir hasta que todos sean únicos",
    rerollOnce: "🎲 Repetir duplicados una vez y conservar",
    standard: "🎲 Tirada estándar",
    final: "Tiradas Finales",
    total: "🎯 Total",
    history: "Historial"
  }
};

function setLanguage(lang) {
  currentLang = lang;
  document.getElementById("history-title").textContent = messages[lang].history;
  rollDice(); // refresh result
}

function rollDice() {
  const input = document.getElementById("diceInput").value.trim();
  const resultEl = document.getElementById("result");

  const regex = /^(\d+)d(\d+)(kh|kl|u|k)?(\d+)?$/i;
  const match = input.match(regex);

  if (!match) {
    resultEl.textContent = messages[currentLang].invalid;
    return;
  }

  const numDice = parseInt(match[1]);
  const dieSize = parseInt(match[2]);
  const mode = match[3] || null;
  const keepAmount = match[4] ? parseInt(match[4]) : null;

  let rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(rollDie(dieSize));
  }

  let finalRolls = [...rolls];
  let explanation = "";

  switch (mode) {
    case "kh":
      finalRolls = rolls.slice().sort((a, b) => b - a).slice(0, keepAmount);
      explanation = `${messages[currentLang].keepHigh} ${keepAmount}`;
      break;
    case "kl":
      finalRolls = rolls.slice().sort((a, b) => a - b).slice(0, keepAmount);
      explanation = `${messages[currentLang].keepLow} ${keepAmount}`;
      break;
    case "u":
      finalRolls = getUniqueRolls(rolls, dieSize);
      explanation = messages[currentLang].unique;
      break;
    case "k":
      finalRolls = rerollDuplicatesOnce(rolls, dieSize);
      explanation = messages[currentLang].rerollOnce;
      break;
    default:
      explanation = messages[currentLang].standard;
  }

  const total = finalRolls.reduce((sum, n) => sum + n, 0);
  const output = `
${messages[currentLang].original}: [${rolls.join(", ")}]
${explanation}
${messages[currentLang].final}: [${finalRolls.join(", ")}]
${messages[currentLang].total}: ${total}
`.trim();

  resultEl.textContent = output;
  addToHistory(input, finalRolls, total);
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function getUniqueRolls(rolls, sides) {
  const seen = new Set();
  const unique = [];

  for (let roll of rolls) {
    if (!seen.has(roll)) {
      unique.push(roll);
      seen.add(roll);
    } else {
      let newRoll;
      let tries = 0;
      do {
        newRoll = rollDie(sides);
        tries++;
      } while (seen.has(newRoll) && tries < 100);
      unique.push(newRoll);
      seen.add(newRoll);
    }
  }

  return unique;
}

function rerollDuplicatesOnce(rolls, sides) {
  const counts = {};
  const result = [];

  for (let roll of rolls) {
    counts[roll] = (counts[roll] || 0) + 1;
  }

  for (let roll of rolls) {
    if (counts[roll] > 1) {
      counts[roll]--;
      result.push(rollDie(sides));
    } else {
      result.push(roll);
    }
  }

  return result;
}

function addToHistory(input, finalRolls, total) {
  const list = document.getElementById("history");
  const li = document.createElement("li");
  li.textContent = `${input} → [${finalRolls.join(", ")}] = ${total}`;
  list.insertBefore(li, list.firstChild);

  history.unshift(li);
  if (history.length > 10) {
    list.removeChild(history.pop());
  }
}
// Help Modal functionality
const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

helpButton.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});

closeHelp.addEventListener("click", () => {
  helpModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    helpModal.classList.add("hidden");
  }
});
