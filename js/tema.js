// Roda no <head>, antes da página aparecer (assim ela não "pisca" clara antes de ficar escura).
// Escolhe o tema: primeiro o que a pessoa escolheu no botão 🌙/☀️ (fica salvo no navegador);
// se ela nunca escolheu, segue o modo do celular/computador.
(function () {
  var tema = null;
  try { tema = localStorage.getItem("tema"); } catch (e) { /* navegador sem armazenamento: segue o sistema */ }
  if (tema !== "claro" && tema !== "escuro") {
    tema = matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  }
  document.documentElement.dataset.tema = tema;
})();
