/* =========================================================
   PROJETO ACOLHE — interações
   1. menu do celular          6. lugares dos pontos de coleta
   2. navegação entre páginas  7. mapa (Leaflet), lista e "Perto de mim"
   3. animação ao rolar        8. infográfico ampliado
   4. abas                     9. efeitos ao rolar (barra, botão de topo, sol)
   5. teste da peça           10. modo escuro (botão 🌙/☀️ e mapa)
   ========================================================= */

// Avisa o CSS que o JavaScript está ligado (libera as animações)
document.documentElement.classList.add("js");


// ===== 1. MENU DO CELULAR =====
var menuBtn = document.getElementById("menuBtn");
var menu = document.getElementById("menu");

function abrirMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  menuBtn.setAttribute("aria-expanded", aberto);
  menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
}

menuBtn.onclick = function () {
  abrirMenu(!menu.classList.contains("aberto"));
};


// ===== 2. NAVEGAÇÃO ENTRE AS "PÁGINAS" =====
// O index.html tem vários blocos <div class="pagina">: início, El Niño, doar...
// Ao clicar num link como href="#doar", mostramos só a página certa
// e escondemos as outras (igual aos sites do Paula Ramos e da barbearia).
var paginas = document.querySelectorAll(".pagina");

// em qual página está cada parte (id → nome da página)
var PAGINA_DE = {
  inicio: "inicio", projeto: "inicio", quem: "inicio", ajudar: "inicio",
  elnino: "elnino", "la-nina": "elnino", mundo: "elnino", brasil: "elnino", sc: "elnino",
  proteja: "proteja",
  doar: "doar", condicoes: "doar", "como-doar": "doar", duvidas: "doar",
  materiais: "materiais",
  voluntario: "voluntario", formas: "voluntario", comecar: "voluntario", postura: "voluntario",
  pontos: "pontos"
};

function mostrarPagina(nome) {
  paginas.forEach(function (pagina) {
    pagina.hidden = pagina.dataset.pagina !== nome;
  });

  // destaca no menu o link da página aberta
  document.querySelectorAll("[data-link-pagina]").forEach(function (link) {
    link.classList.toggle("ativo", link.dataset.linkPagina === nome);
  });

  // o mapa só é criado quando a página dos pontos abre pela primeira vez
  if (nome === "pontos") abrirMapa();
}

function irPara(id) {
  var nome = PAGINA_DE[id] || "inicio";
  mostrarPagina(nome);

  var parte = document.getElementById(id);
  if (id !== nome && parte) {
    // a parte fica no meio da página (ex.: "como-doar" dentro de doar): rola até ela
    requestAnimationFrame(function () { parte.scrollIntoView({ block: "start" }); });
  } else {
    // página nova: começa lá do topo ("instant" pula direto, sem rolagem suave)
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

// todos os links internos (href começando com #) passam pela função irPara
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  var id = link.getAttribute("href").slice(1); // tira o "#"
  if (!(id in PAGINA_DE)) return;

  link.addEventListener("click", function (evento) {
    evento.preventDefault(); // impede o pulo padrão do navegador
    abrirMenu(false);
    irPara(id);
    // guarda no histórico: o botão "voltar" do navegador funciona
    // e dá para mandar o link de uma página (ex.: site.com/#pontos)
    history.pushState(null, "", "#" + id);
  });
});

// botão "voltar" / "avançar" do navegador
window.addEventListener("popstate", function () {
  var id = location.hash.slice(1);
  irPara(id in PAGINA_DE ? id : "inicio");
});


// ===== 3. ANIMAÇÃO AO ROLAR =====
// estes elementos também ganham a animação, sem precisar escrever "rv" um por um no HTML
document.querySelectorAll(".cab, .step, .tel a, .tags li, .filtros, .mapa-area, .atalho").forEach(function (el) {
  el.classList.add("rv");
});

// elementos "irmãos" aparecem um depois do outro: cada um recebe um número (--i) usado no atraso do CSS
document.querySelectorAll(".rv").forEach(function (el) {
  var irmaos = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.classList.contains("rv"); });
  el.style.setProperty("--i", Math.min(irmaos.indexOf(el), 6));
});

// quando um elemento com a classe "rv" aparece na tela, ganha a classe "on"
var observador = new IntersectionObserver(function (itens) {
  itens.forEach(function (item) {
    if (item.isIntersecting) {
      item.target.classList.add("on");
      observador.unobserve(item.target);
    }
  });
}, { threshold: .15 });

document.querySelectorAll(".rv").forEach(function (el) { observador.observe(el); });


// ===== 4. ABAS (Antes/Durante/Depois e categorias de doação) =====
// cada botão tem data-aba="id do painel" que ele mostra
document.querySelectorAll(".abas").forEach(function (abas) {
  var botoes = abas.querySelectorAll("button");
  botoes.forEach(function (botao) {
    botao.onclick = function () {
      botoes.forEach(function (b) {
        var ativo = b === botao;
        b.classList.toggle("on", ativo);
        b.setAttribute("aria-selected", ativo);
        document.getElementById(b.dataset.aba).classList.toggle("on", ativo);
      });
    };
  });
});


// ===== 5. TESTE: ESSA PEÇA PODE SER DOADA? =====
var quiz = document.getElementById("quiz");
var perguntas = quiz.querySelectorAll("input");
var resultado = quiz.querySelector(".quiz-res");

perguntas.forEach(function (caixa) {
  caixa.onchange = function () {
    // junta o que ainda falta (texto do data-falta das caixas não marcadas)
    var faltam = [];
    perguntas.forEach(function (p) { if (!p.checked) faltam.push(p.dataset.falta); });

    resultado.classList.remove("sim", "nao");
    if (faltam.length === 0) {
      resultado.textContent = "✔ Pode doar! Essa peça vai ajudar alguém de verdade.";
      resultado.classList.add("sim");
    } else if (faltam.length < perguntas.length) {
      resultado.textContent = "Ainda não. Antes de doar, falta: " + faltam.join(", ") + ".";
      resultado.classList.add("nao");
    } else {
      resultado.textContent = "Marque os itens para ver o resultado.";
    }
  };
});


// ===== 6. LUGARES DOS PONTOS DE COLETA =====
// tipos de lugar: ícone, nome e a dica que aparece ao filtrar
var TIPOS = {
  igreja:   { ico: "⛪", nome: "Igreja",             dica: "Igrejas já fazem campanhas e têm salão para guardar as doações." },
  mercado:  { ico: "🛒", nome: "Supermercado",       dica: "Uma caixa na saída para roupas e cobertas: quem passa, doa." },
  terminal: { ico: "🚌", nome: "Terminal",           dica: "Milhares de pessoas passam todo dia pelos terminais de ônibus." },
  publico:  { ico: "🏛️", nome: "Prédio público",     dica: "Muita gente passa por lá todo dia, e eles ajudam a divulgar." },
  escola:   { ico: "🏫", nome: "Escola / faculdade", dica: "Uma campanha do agasalho entre as turmas faz a arrecadação crescer." },
  shopping: { ico: "🛍️", nome: "Shopping",           dica: "Muito movimento, principalmente nos fins de semana." },
  clube:    { ico: "⚽", nome: "Clube / estádio",    dica: "Dia de jogo ou evento: o ingresso solidário pode ser um agasalho." }
};

// [nome, tipo, cidade, latitude, longitude] — coordenadas do OpenStreetMap
var LUGARES = [
  ["Catedral Metropolitana", "igreja", "Florianópolis", -27.59645, -48.54926],
  ["Igreja Nossa Senhora da Lapa", "igreja", "Florianópolis", -27.71832, -48.56318],
  ["Igreja Nosso Senhor dos Passos", "igreja", "São José", -27.61564, -48.62817],
  ["Igreja de São Miguel", "igreja", "Biguaçu", -27.45712, -48.63800],
  ["Igreja Matriz Sagrado Coração de Jesus", "igreja", "Antônio Carlos", -27.51796, -48.76715],
  ["Igreja de São Sebastião", "igreja", "Santo Amaro da Imperatriz", -27.69201, -48.73737],

  ["Angeloni Centro", "mercado", "Florianópolis", -27.59235, -48.55316],
  ["Angeloni Santa Mônica", "mercado", "Florianópolis", -27.59145, -48.51318],
  ["Angeloni Capoeiras", "mercado", "Florianópolis", -27.60091, -48.59660],
  ["Bistek Coqueiros", "mercado", "Florianópolis", -27.60462, -48.59259],
  ["Hippo Supermercados", "mercado", "Florianópolis", -27.58982, -48.56061],
  ["Imperatriz Lagoa", "mercado", "Florianópolis", -27.60452, -48.46701],
  ["Giassi Barreiros", "mercado", "São José", -27.55378, -48.62294],
  ["Fort Atacadista Kobrasol", "mercado", "São José", -27.59066, -48.61643],
  ["Fort Atacadista", "mercado", "Palhoça", -27.64553, -48.67008],
  ["Giassi Pagani", "mercado", "Palhoça", -27.64212, -48.67033],
  ["Bistek Pagani", "mercado", "Palhoça", -27.63921, -48.68231],

  ["Terminal do Centro (TICEN)", "terminal", "Florianópolis", -27.59859, -48.55382],
  ["Terminal da Trindade (TITRI)", "terminal", "Florianópolis", -27.58397, -48.52285],
  ["Terminal da Lagoa (TILAG)", "terminal", "Florianópolis", -27.60279, -48.47080],
  ["Terminal de Canasvieiras (TICAN)", "terminal", "Florianópolis", -27.45226, -48.45596],
  ["Rodoviária Rita Maria", "terminal", "Florianópolis", -27.59717, -48.55803],

  ["Assembleia Legislativa (Alesc)", "publico", "Florianópolis", -27.60324, -48.54776],
  ["Câmara Municipal", "publico", "Florianópolis", -27.59624, -48.54867],
  ["Prefeitura de Florianópolis", "publico", "Florianópolis", -27.59484, -48.55617],
  ["Mercado Público", "publico", "Florianópolis", -27.59733, -48.55306],
  ["Centro Administrativo do Governo de SC", "publico", "Florianópolis", -27.54094, -48.50330],
  ["Prefeitura de São José", "publico", "São José", -27.60945, -48.62692],
  ["Prefeitura de Palhoça", "publico", "Palhoça", -27.64060, -48.67923],
  ["Prefeitura de Biguaçu", "publico", "Biguaçu", -27.49592, -48.65428],
  ["Prefeitura de Santo Amaro", "publico", "Santo Amaro da Imperatriz", -27.68639, -48.77740],

  ["Faculdade Senac", "escola", "Florianópolis", -27.60371, -48.54685],
  ["UFSC", "escola", "Florianópolis", -27.60341, -48.52244],
  ["IFSC Campus Florianópolis", "escola", "Florianópolis", -27.59395, -48.54205],
  ["Udesc", "escola", "Florianópolis", -27.58573, -48.50299],
  ["Univali", "escola", "São José", -27.59789, -48.61982],
  ["IFSC Campus São José", "escola", "São José", -27.60847, -48.63320],
  ["Unisul Pedra Branca", "escola", "Palhoça", -27.62499, -48.68293],

  ["Beiramar Shopping", "shopping", "Florianópolis", -27.58478, -48.54505],
  ["Floripa Shopping", "shopping", "Florianópolis", -27.55400, -48.49848],
  ["Shopping Itaguaçu", "shopping", "São José", -27.58544, -48.61421],
  ["Continente Shopping", "shopping", "São José", -27.61459, -48.64666],
  ["Shopping ViaCatarina", "shopping", "Palhoça", -27.64192, -48.67158],

  ["Paula Ramos Esporte Clube", "clube", "Florianópolis", -27.59317, -48.51754],
  ["Lira Tênis Clube", "clube", "Florianópolis", -27.59418, -48.55495],
  ["Clube Doze de Agosto", "clube", "Florianópolis", -27.60981, -48.57877],
  ["Estádio da Ressacada (Avaí)", "clube", "Florianópolis", -27.66639, -48.53167],
  ["Estádio Orlando Scarpelli (Figueirense)", "clube", "Florianópolis", -27.58555, -48.58647]
];

// lista de cidades, sem repetir e em ordem alfabética
var CIDADES = LUGARES.map(function (l) { return l[2]; })
  .filter(function (c, i, todas) { return todas.indexOf(c) === i; })
  .sort();

// escreve os totais no site (início e página dos pontos)
function escrever(seletor, valor) {
  document.querySelectorAll(seletor).forEach(function (el) { el.textContent = valor; });
}
escrever(".n-lugares", LUGARES.length);
escrever(".n-cidades", CIDADES.length);
escrever(".n-tipos", Object.keys(TIPOS).length);

// coloca as cidades no seletor
var filtroCidade = document.getElementById("filtroCidade");
CIDADES.forEach(function (cidade) {
  var opcao = document.createElement("option");
  opcao.value = cidade;
  opcao.textContent = cidade;
  filtroCidade.appendChild(opcao);
});


// ===== 7. MAPA (Leaflet) E LISTA DE LUGARES =====
var mapaEl = document.getElementById("mapaColeta");
var listaEl = document.getElementById("listaPontos");
var contagem = document.getElementById("contagem");
var dicaMapa = document.getElementById("dicaMapa");
var dicaInicial = dicaMapa.textContent;
var mapa = null, marcadores = [];
var tipoEscolhido = "todos", cidadeEscolhida = "todas";
var minhaPosicao = null, marcadorEu = null;   // usados no botão "Perto de mim"

// chamado quando a página dos pontos abre
function abrirMapa() {
  if (!window.L) {   // sem internet a biblioteca não carrega
    mapaEl.innerHTML = '<p class="note mapa-off">Conecte-se à internet para ver o mapa.</p>';
    return;
  }
  if (mapa) {   // o mapa já existe: só avisa que ele voltou a aparecer na tela
    requestAnimationFrame(function () { mapa.invalidateSize(); });
    return;
  }

  // cria o mapa (a rodinha do mouse não dá zoom, para não atrapalhar a rolagem)
  mapa = L.map(mapaEl, { scrollWheelZoom: false }).setView([-27.60, -48.58], 11);

  // fundo do mapa + nomes das ruas e cidades (mapas gratuitos da Esri), claro ou escuro conforme o tema
  fundoDoMapa();

  // indicador vermelho (o visual está no CSS, classe .pino)
  var pino = L.divIcon({ className: "pino", html: "<i></i>", iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10] });

  // um marcador e um item da lista para cada lugar
  marcadores = LUGARES.map(function (lugar) {
    var tipo = TIPOS[lugar[1]];
    var marcador = L.marker([lugar[3], lugar[4]], { icon: pino, title: lugar[0] });
    marcador.bindPopup("<b>" + tipo.ico + " " + lugar[0] + "</b><span>" + tipo.nome + " · " + lugar[2] + "</span>");
    marcador.lugar = lugar;

    var item = document.createElement("li");
    item.innerHTML = '<button type="button"><span class="lp-ico">' + tipo.ico + "</span><b>" + lugar[0] + "</b><small>" + lugar[2] + "</small></button>";
    marcador.onde = item.querySelector("small");   // mostra a cidade, ou a distância no "Perto de mim"
    item.querySelector("button").onclick = function () {
      // no celular a lista fica embaixo do mapa: sobe até ele antes
      if (innerWidth < 900) mapaEl.scrollIntoView({ behavior: "smooth", block: "center" });
      mapa.flyTo(marcador.getLatLng(), 15, { duration: .8 });
      marcador.openPopup();
    };
    marcador.item = item;
    return marcador;
  });

  atualizarMapa();
}

// coloca o fundo do mapa na cor do tema (troca quando a pessoa muda claro/escuro)
var camadasDoMapa = [];
function fundoDoMapa() {
  if (!mapa) return;
  camadasDoMapa.forEach(function (camada) { camada.remove(); });

  var cor = document.documentElement.dataset.tema === "escuro" ? "Dark" : "Light";
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_" + cor + "_Gray_";
  camadasDoMapa = [
    L.tileLayer(ESRI + "Base/MapServer/tile/{z}/{y}/{x}", { attribution: "Mapa &copy; Esri, OpenStreetMap", maxZoom: 16 }),
    L.tileLayer(ESRI + "Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16 })
  ];
  camadasDoMapa.forEach(function (camada) { camada.addTo(mapa); });
}

// mostra só os lugares do tipo e da cidade escolhidos
// (no modo "Perto de mim": os 5 mais próximos da pessoa, do tipo escolhido)
function atualizarMapa() {
  if (!mapa) return;
  var visiveis = marcadores.filter(function (m) {
    var lugar = m.lugar;
    var tipoOk = tipoEscolhido === "todos" || lugar[1] === tipoEscolhido;
    var cidadeOk = minhaPosicao || cidadeEscolhida === "todas" || lugar[2] === cidadeEscolhida;
    m.onde.textContent = lugar[2];
    return tipoOk && cidadeOk;
  });

  if (minhaPosicao) {
    visiveis.forEach(function (m) { m.km = distanciaKm(minhaPosicao, [m.lugar[3], m.lugar[4]]); });
    visiveis.sort(function (x, y) { return x.km - y.km; });
    visiveis = visiveis.slice(0, 5);
    visiveis.forEach(function (m) { m.onde.textContent = formatarKm(m.km); });
  }

  listaEl.innerHTML = "";
  var posicoes = [];
  marcadores.forEach(function (m) { m.remove(); });
  visiveis.forEach(function (m) {
    m.addTo(mapa);
    posicoes.push(m.getLatLng());
    listaEl.appendChild(m.item);
  });
  if (minhaPosicao) posicoes.push(minhaPosicao);

  var n = visiveis.length;
  contagem.textContent = minhaPosicao ? "Mais perto de você" : (n === 1 ? "1 lugar" : n + " lugares");
  if (!minhaPosicao) dicaMapa.textContent = tipoEscolhido === "todos" ? dicaInicial : "💡 " + TIPOS[tipoEscolhido].dica;

  if (posicoes.length) {
    mapa.fitBounds(posicoes, { padding: [40, 40], maxZoom: 14 });
  }
  if (!n) listaEl.innerHTML = '<li class="lp-vazio">Nenhum lugar desse tipo nessa cidade.</li>';
}

// distância em linha reta entre dois pontos [lat, lng], em km (fórmula de Haversine)
function distanciaKm(a, b) {
  var rad = Math.PI / 180, R = 6371;   // raio da Terra
  var dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatarKm(km) {
  return km < 1 ? Math.round(km * 1000) + " m" : km.toFixed(1).replace(".", ",") + " km";
}

// ----- botão "Perto de mim": pede a localização do celular -----
var pertoBtn = document.getElementById("pertoBtn");

function desligarPerto() {
  minhaPosicao = null;
  if (marcadorEu) { marcadorEu.remove(); marcadorEu = null; }
  pertoBtn.textContent = "📍 Perto de mim";
  pertoBtn.classList.remove("on");
}

pertoBtn.onclick = function () {
  if (!mapa) return;
  if (minhaPosicao) {   // já está ligado: volta a mostrar todos
    desligarPerto();
    atualizarMapa();
    return;
  }
  if (!navigator.geolocation) {
    dicaMapa.textContent = "Seu navegador não consegue mostrar a localização.";
    return;
  }
  pertoBtn.textContent = "⏳ Procurando você...";
  navigator.geolocation.getCurrentPosition(function (pos) {
    minhaPosicao = [pos.coords.latitude, pos.coords.longitude];
    cidadeEscolhida = "todas";
    filtroCidade.value = "todas";

    // bolinha azul = você
    marcadorEu = L.marker(minhaPosicao, {
      icon: L.divIcon({ className: "pino-eu", html: "<i></i>", iconSize: [20, 20], iconAnchor: [10, 10] }),
      title: "Você está aqui",
      zIndexOffset: 1000   // fica sempre por cima dos pinos vermelhos
    }).bindPopup("<b>📍 Você está aqui</b>").addTo(mapa);

    pertoBtn.textContent = "✕ Ver todos os lugares";
    pertoBtn.classList.add("on");
    atualizarMapa();

    var maisPerto = listaEl.firstChild && marcadores.filter(function (m) { return m.item === listaEl.firstChild; })[0];
    dicaMapa.textContent = maisPerto && maisPerto.km > 50
      ? "Você está longe da Grande Florianópolis. Mostrando os lugares mais próximos mesmo assim."
      : "💙 Estes são os 5 lugares mais perto de você (em linha reta).";
  }, function () {
    pertoBtn.textContent = "📍 Perto de mim";
    dicaMapa.textContent = "Não deu para pegar sua localização. Libere a localização para este site e tente de novo.";
  }, { enableHighAccuracy: true, timeout: 10000 });
};

var filtrosMapa = document.querySelectorAll("#filtroMapa button");
filtrosMapa.forEach(function (botao) {
  botao.onclick = function () {
    filtrosMapa.forEach(function (b) { b.classList.toggle("on", b === botao); });
    tipoEscolhido = botao.dataset.cat;
    atualizarMapa();
  };
});

filtroCidade.onchange = function () {
  cidadeEscolhida = filtroCidade.value;
  desligarPerto();   // escolher uma cidade sai do modo "Perto de mim"
  atualizarMapa();
};


// ===== 8. INFOGRÁFICO AMPLIADO =====
// ao tocar no infográfico, ele abre grande numa janela (<dialog>)
var zoom = document.getElementById("zoom");

document.getElementById("abrirInfo").onclick = function () { zoom.showModal(); };
document.getElementById("fecharInfo").onclick = function () { zoom.close(); };

// fecha também ao clicar fora da imagem (no fundo escuro)
zoom.addEventListener("click", function (e) {
  if (e.target === zoom) zoom.close();
});


// ===== 9. EFEITOS AO ROLAR A PÁGINA =====
var progresso = document.getElementById("progresso");
var voltarTopo = document.getElementById("voltarTopo");
var raios = document.querySelector(".raios");

function aoRolar() {
  var y = scrollY;
  var total = document.documentElement.scrollHeight - innerHeight;

  // barrinha dourada no topo: cresce conforme a página é lida
  progresso.style.transform = "scaleX(" + (total > 0 ? y / total : 0) + ")";

  // botão de voltar ao topo aparece depois de rolar um pouco
  voltarTopo.classList.toggle("mostrar", y > innerHeight * .6);

  // raios de sol da capa descem mais devagar que a página (efeito de profundidade)
  if (y < innerHeight) raios.style.translate = "0 " + (y * .35) + "px";
}

voltarTopo.onclick = function () { window.scrollTo({ top: 0 }); };

// o navegador avisa da rolagem dezenas de vezes por segundo:
// juntamos tudo e atualizamos no máximo 1 vez por quadro (não pesa no computador)
var rolagemAgendada = false;
addEventListener("scroll", function () {
  if (rolagemAgendada) return;
  rolagemAgendada = true;
  requestAnimationFrame(function () {
    rolagemAgendada = false;
    aoRolar();
  });
}, { passive: true });


// ===== 10. MODO ESCURO =====
// o js/tema.js já escolheu o tema antes da página aparecer; aqui ficam o botão 🌙/☀️ e o resto
var temaBtn = document.getElementById("temaBtn");
var corDoNavegador = document.querySelector('meta[name="theme-color"]');

function aplicarTema(tema) {
  var escuro = tema === "escuro";
  document.documentElement.dataset.tema = tema;
  temaBtn.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  corDoNavegador.content = escuro ? "#0c1727" : "#f9f5f0";   // cor da barra do navegador no celular

  // os logos trocam sozinhos pelo CSS (classes .logo-claro / .logo-escuro)

  fundoDoMapa();
}

temaBtn.onclick = function () {
  var novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
  try { localStorage.setItem("tema", novo); } catch (e) { /* sem armazenamento: só não fica salvo */ }
  aplicarTema(novo);
};

// se a pessoa nunca apertou o botão, o site acompanha quando o celular/computador muda de modo
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
  var salvo = null;
  try { salvo = localStorage.getItem("tema"); } catch (erro) { /* sem armazenamento */ }
  if (!salvo) aplicarTema(e.matches ? "escuro" : "claro");
});

aplicarTema(document.documentElement.dataset.tema || "claro");


// ===== COMEÇO =====
// abre a página certa: se o endereço já tiver um # (ex.: site.com/#pontos), vai direto para ela
var enderecoInicial = location.hash.slice(1);
irPara(enderecoInicial in PAGINA_DE ? enderecoInicial : "inicio");
aoRolar();
