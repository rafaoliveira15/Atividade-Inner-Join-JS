// =================================
// FRONT-END - CAPTURA DADOS DIGITADOS PELO USUÁRIO
// captura dados digitados pelo usuário
// envia informações ao servidor
// atualiza tabelas HTML
// cria interação visual
// consome as APIs do Express
// =================================

const API = "http://localhost:3000";


// ==============================
// CADASTRAR SITE
// ==============================

async function cadastrarSite() {

    const nome = document.getElementById("nome").value;

    const url = document.getElementById("url").value;

    const segmento = document.getElementById("segmento").value;

    const resposta = await fetch(`${API}/sites`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nome,
            url,
            segmento
        })
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    carregarSites();
}


// ==============================
// LISTAR SITES
// ==============================

async function carregarSites() {

    const resposta = await fetch(`${API}/sites`);

    const sites = await resposta.json();
    const lista = document.getElementById("listaSites");
    lista.innerHTML = "";

    sites.forEach(site => {
        lista.innerHTML += `
            <div class="site-item">
                <strong>${site.nome}</strong> - ${site.segmento}<br>
                <small>${site.url}</small><br>
                <button onclick="coletarDados(${site.id})">Coletar Dados</button>
            </div>
        `;
    });
}

// ------------------------------------------
// COLETAR DADOS
// ------------------------------------------

async function coletarDados(id) {
    const resposta = await fetch(`${API}/coletar/${id}`, {
        method: "POST"
    });

    const dados = await resposta.json();

    alert(dados.mensagem || dados.erro);

    carregarDashboard();
    carregarPalavras();
}

// ------------------------------------------
// CARREGAR DASHBOARD
// ==========================================

// Função assíncrona responsável por buscar os dados do dashboard no servidor
// e exibir esses dados dentro de uma tabela HTML na tela.
async function carregarDashboard() {

    // Faz uma requisição HTTP do tipo GET para a rota /dashboard do servidor.
    // A constante API normalmente contém o endereço do servidor, por exemplo:
    // http://localhost:3000
    //
    // Então, na prática, o fetch acessa:
    // http://localhost:3000/dashboard
    const resposta = await fetch(`${API}/dashboard`);

    // Converte a resposta recebida do servidor para o formato JSON.
    // O servidor envia os dados como JSON, e esta linha transforma esses dados
    // em um objeto/array JavaScript que pode ser manipulado no front-end.
    const dados = await resposta.json();

    // Busca no HTML o elemento que possui o id "tabelaDashboard".
    // Normalmente esse elemento é o corpo de uma tabela, por exemplo:
    // <tbody id="tabelaDashboard"></tbody>
    const tabela = document.getElementById("tabelaDashboard");

    // Limpa o conteúdo atual da tabela antes de inserir os novos dados.
    // Isso evita que os dados sejam duplicados toda vez que a função for chamada.
    tabela.innerHTML = "";

    // Percorre cada item do array "dados".
    // Cada "item" representa uma coleta retornada pelo servidor,
    // contendo informações como nome do site, segmento, data da coleta,
    // total de links, imagens, títulos, e-mails e palavras.
    dados.forEach(item => {

        // Adiciona uma nova linha <tr> dentro da tabela.
        // Cada <td> representa uma célula da tabela.
        tabela.innerHTML += `
            <tr>
                <td>${item.nome}</td>

                <td>${item.segmento}</td>

                <td>${item.data_coleta}</td>

                <td>${item.total_links}</td>

                <td>${item.total_links}</td>

                <td>${item.total_imagens}</td>

                <td>${item.total_titulos}</td>

                <td>${item.total_emails}</td>

                <td>${item.total_palavras}</td>
            </tr>
        `;
    });
}

// ------------------------------------------
// CARREGAR PALAVRAS-CHAVE
// ------------------------------------------

async function carregarPalavras() {
    const resposta = await fetch(`${API}/palavras`);
    const dados = await resposta.json();

    const tabela = document.getElementById("tabelaPalavras");
    tabela.innerHTML = "";

    dados.forEach(item => {
        tabela.innerHTML += `
            <tr>
                <td>${item.site}</td>
                <td>${item.palavra}</td>
                <td>${item.quantidade}</td>
            </tr>
        `;
    });
}
// Carrega os dados iniciais
    carregarSites();
    carregarDashboard();
    carregarPalavras();