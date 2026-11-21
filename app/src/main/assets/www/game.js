const cases = {
  mira: {name:"Мира Сато", role:"Архивариус · 28 лет", number:"01", intro:"Утверждает, что закрыла архив в 21:15 и после этого не возвращалась. В журнале доступа есть странная запись.", quote:"«Я просто выполняла свою работу. Больше мне нечего добавить».", clue:"В журнале доступа отметка Миры стоит в 21:32 — через семнадцать минут после заявленного ухода. Но запись могла быть внесена позже.", title:"Журнал доступа"},
  ren: {name:"Рэн Исида", role:"Студент · 21 год", number:"02", intro:"Говорит, что готовился к экзамену в читальном зале и ничего не слышал. На его столе нашли обрывок записки.", quote:"«Я даже не знал, что там кто-то был».", clue:"На обороте конспекта Рэна обнаружены слова «встретимся после закрытия». Почерк не совпадает с его записями.", title:"Обрывок записки"},
  kaito: {name:"Кайто Морита", role:"Охранник · 42 года", number:"03", intro:"Дежурил у главного входа. Уверяет, что камеры работали всю ночь, хотя запись за несколько минут пропала.", quote:"«Камеры иногда перезагружаются. Это обычное дело».", clue:"Камера у восточного коридора отключилась ровно на девять минут. Только охрана имела доступ к панели управления.", title:"Запись с камеры"}
};
const found = new Set();
let selectedSuspect = "mira";
let selectedVerdict = "";
const $ = id => document.getElementById(id);
const suspectButtons = [...document.querySelectorAll(".suspect")];
const verdictButtons = [...document.querySelectorAll("[data-verdict]")];

function renderSuspect(id){
  selectedSuspect = id;
  const s = cases[id];
  suspectButtons.forEach(b => b.classList.toggle("selected", b.dataset.suspect === id));
  $("suspectDetail").innerHTML = `
    <div class="detail-top"><span class="tag">ПОДОЗРЕВАЕМЫЙ № ${s.number}</span><span class="status">${found.has(id) ? "УЛИКА ИЗУЧЕНА" : "ОЖИДАЕТ ПРОВЕРКИ"}</span></div>
    <h3>${s.name}</h3><p>${s.intro}</p><div class="quote">${s.quote}</div>
    <button class="action-button" id="clueBtn">${found.has(id) ? "УЛИКА УЖЕ В ДНЕВНИКЕ" : "ИЗУЧИТЬ УЛИКУ"} <span>→</span></button>`;
  $("clueBtn").addEventListener("click", () => inspectClue(id));
}
function updateProgress(){
  $("progressText").textContent = found.size + " / 3";
  $("progressBar").style.width = (found.size/3*100) + "%";
  $("evidenceCount").textContent = found.size + " улик найдено";
  $("verdictBtn").disabled = found.size !== 3 || !selectedVerdict;
  if(found.size === 3) $("verdictMessage").textContent = "Все материалы изучены. Время принять решение.";
}
function inspectClue(id){
  if(found.has(id)){ $("verdictMessage").textContent = "Эта улика уже добавлена в материалы дела."; return; }
  found.add(id);
  const s = cases[id];
  const entry = document.createElement("p");
  entry.className = "muted";
  entry.textContent = "▸ " + s.title + ": " + s.clue;
  $("suspectDetail").appendChild(entry);
  $("suspectDetail").querySelector(".status").textContent = "УЛИКА ИЗУЧЕНА";
  $("suspectDetail").querySelector("#clueBtn").textContent = "УЛИКА ДОБАВЛЕНА ✓";
  updateProgress();
}
suspectButtons.forEach(b => b.addEventListener("click", () => renderSuspect(b.dataset.suspect)));
verdictButtons.forEach(b => b.addEventListener("click", () => {
  selectedVerdict = b.dataset.verdict;
  verdictButtons.forEach(x => x.classList.toggle("chosen", x === b));
  $("verdictBtn").disabled = found.size !== 3;
}));
$("verdictBtn").addEventListener("click", () => {
  if(found.size !== 3 || !selectedVerdict) return;
  const correct = selectedVerdict === "kaito";
  $("verdictMessage").textContent = correct
    ? "ВЕРНО. Кайто имел доступ к панели камер. Дело раскрыто — но кто оставил записку?"
    : "НЕВЕРНО. В этой версии не сходятся факты. Пересмотри улики и попробуй снова.";
  $("verdictMessage").style.color = correct ? "#c5a66a" : "#c56b70";
  if(correct) $("verdictBtn").textContent = "ДЕЛО РАСКРЫТО ✓";
});
const notes = $("notes");
notes.value = localStorage.getItem("blackFilesNotes") || "";
notes.addEventListener("input", () => {
  localStorage.setItem("blackFilesNotes", notes.value);
  $("saveStatus").textContent = "СОХРАНЕНО АВТОМАТИЧЕСКИ";
});
$("restartBtn").addEventListener("click", () => {
  found.clear(); selectedVerdict = "";
  verdictButtons.forEach(b => b.classList.remove("chosen"));
  $("verdictBtn").textContent = "ВЫНЕСТИ ВЕРДИКТ";
  $("verdictBtn").disabled = true;
  $("verdictMessage").textContent = "Сначала собери все улики.";
  $("verdictMessage").style.color = "";
  updateProgress(); renderSuspect("mira");
});
updateProgress();
