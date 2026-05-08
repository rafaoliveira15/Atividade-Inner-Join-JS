// =================================
// BACK-END - MONITOR DE SITES
// =================================

// ==============================
// IMPORTAÇÃO DAS BIBLIOTECAS
// ==============================

// Biblioteca para criar o servidor
const express = require("express");

// Permite comunicação entre front-end e back-end
const cors = require("cors");

// Faz requisições HTTP
const axios = require("axios");

// Manipula HTML
const cheerio = require("cheerio");

// Banco SQLite
const sqlite3 = require("sqlite3").verbose();

// Trabalhar com caminhos
const path = require("path");


// ==============================
// CONFIGURAÇÃO DO SERVIDOR
// ==============================

const app = express();

const PORT = 3000;

// Libera acesso do front-end
app.use(cors());

// Permite JSON
app.use(express.json());

// Arquivos estáticos
app.use(express.static("public"));


// ==============================
// CONEXÃO COM BANCO
// ==============================

const db = new sqlite3.Database("banco.db");


// ==============================
// CRIAÇÃO DAS TABELAS
// ==============================

db.serialize(() => {

    // ==========================
    // TABELA SITES
    // ==========================

    db.run(`
        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            url TEXT NOT NULL,
            segmento TEXT NOT NULL
        )
    `);

    // ==========================
    // TABELA COLETAS
    // ==========================

    db.run(`
        CREATE TABLE IF NOT EXISTS coletas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER NOT NULL,
            data_coleta TEXT NOT NULL,
            total_links INTEGER,
            total_imagens INTEGER,
            total_titulos INTEGER,
            total_emails INTEGER,
            total_palavras INTEGER,
            FOREIGN KEY (site_id) REFERENCES sites(id)
        )
    `);

    // ==========================
    // TABELA PALAVRAS-CHAVE
    // ==========================

    db.run(`
        CREATE TABLE IF NOT EXISTS palavras_chave (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coleta_id INTEGER NOT NULL,
            palavra TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            FOREIGN KEY (coleta_id) REFERENCES coletas(id)
        )
    `);

});


// ==============================
// ROTA CADASTRAR SITE
// ==============================

app.post("/sites", (req, res) => {

    const { nome, url, segmento } = req.body;

    // Validação
    if (!nome || !url || !segmento) {

        return res.status(400).json({
            erro: "Preencha nome, URL e segmento."
        });
    }

    // Inserção
    db.run(
        "INSERT INTO sites (nome, url, segmento) VALUES (?, ?, ?)",
        [nome, url, segmento],

        function (err) {

            if (err) {

                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json({
                mensagem: "Site cadastrado com sucesso!",
                id: this.lastID
            });
        }
    );
});


// ==============================
// ROTA LISTAR SITES
// ==============================

app.get("/sites", (req, res) => {

    db.all(
        "SELECT * FROM sites ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json(rows);
        }
    );
});


// ==============================
// ROTA COLETAR DADOS
// ==============================

app.post("/coletar/:id", async (req, res) => {

    const siteId = req.params.id;

    // Busca site
    db.get(
        "SELECT * FROM sites WHERE id = ?",
        [siteId],

        async (err, site) => {

            if (err || !site) {

                return res.status(404).json({
                    erro: "Site não encontrado."
                });
            }

            try {

                // Acessa o site
                const resposta = await axios.get(site.url);

                // Carrega HTML
                const $ = cheerio.load(resposta.data);

                // Texto da página
                const textoPagina = $("body").text();

                // ==========================
                // REGEX EMAIL
                // ==========================

                const regexEmail =
                    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;

                const emailsEncontrados =
                    textoPagina.match(regexEmail) || [];

                // ==========================
                // REGEX PALAVRAS
                // ==========================

                const regexPalavras =
                    /\b[a-zA-Zà-ÿ]{4,}\b/gi;

                const palavras =
                    textoPagina.match(regexPalavras) || [];

                // ==========================
                // CONTAGENS
                // ==========================

                const totalLinks = $("a").length;

                const totalImagens = $("img").length;

                const totalTitulos =
                    $("h1, h2, h3").length;

                const totalEmails =
                    emailsEncontrados.length;

                const totalPalavras =
                    palavras.length;

                // Data
                const dataColeta =
                    new Date().toLocaleString("pt-BR");

                // ==========================
                // INSERE COLETA
                // ==========================

                db.run(
                    `
                    INSERT INTO coletas
                    (
                        site_id,
                        data_coleta,
                        total_links,
                        total_imagens,
                        total_titulos,
                        total_emails,
                        total_palavras
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,
                    [
                        siteId,
                        dataColeta,
                        totalLinks,
                        totalImagens,
                        totalTitulos,
                        totalEmails,
                        totalPalavras
                    ],

                    function (err) {

                        if (err) {

                            return res.status(500).json({
                                erro: err.message
                            });
                        }

                        // ======================
                        // ID DA COLETA
                        // ======================

                        const coletaId = this.lastID;

                        // ======================
                        // CONTAGEM PALAVRAS
                        // ======================

                        const contagem = {};

                        palavras.forEach((palavra) => {

                            const p =
                                palavra.toLowerCase();

                            contagem[p] =
                                (contagem[p] || 0) + 1;
                        });

                        // ======================
                        // TOP 5 PALAVRAS
                        // ======================

                        const palavrasOrdenadas =
                            Object.entries(contagem)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5);

                        // ======================
                        // SALVA PALAVRAS
                        // ======================

                        palavrasOrdenadas.forEach(
                            ([palavra, quantidade]) => {

                                db.run(
                                    `
                                    INSERT INTO palavras_chave
                                    (coleta_id, palavra, quantidade)
                                    VALUES (?, ?, ?)
                                    `,
                                    [
                                        coletaId,
                                        palavra,
                                        quantidade
                                    ]
                                );
                            }
                        );

                        // ======================
                        // RETORNO
                        // ======================

                        res.json({
                            mensagem:
                                "Coleta realizada com sucesso!",

                            site: site.nome,

                            totalLinks,

                            totalImagens,

                            totalTitulos,

                            totalEmails,

                            totalPalavras
                        });
                    }
                );

            } catch (erro) {

                res.status(500).json({
                    erro:
                        "Erro ao acessar o site. Verifique a URL ou bloqueio do site."
                });
            }
        }
    );
});


// ==============================
// ROTA DASHBOARD
// ==============================

app.get("/dashboard", (req, res) => {

    db.all(
        `
        SELECT
            coletas.id,
            sites.nome,
            sites.url,
            sites.segmento,
            coletas.data_coleta,
            coletas.total_links,
            coletas.total_imagens,
            coletas.total_titulos,
            coletas.total_emails,
            coletas.total_palavras

        FROM coletas

        INNER JOIN sites
        ON sites.id = coletas.site_id

        ORDER BY coletas.id DESC
        `,
        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json(rows);
        }
    );
});


// ==============================
// ROTA PALAVRAS-CHAVE
// ==============================

app.get("/palavras", (req, res) => {

    db.all(
        `
        SELECT
            sites.nome AS site,
            palavras_chave.palavra,
            palavras_chave.quantidade

        FROM palavras_chave

        INNER JOIN coletas
        ON coletas.id = palavras_chave.coleta_id

        INNER JOIN sites
        ON sites.id = coletas.site_id

        ORDER BY palavras_chave.quantidade DESC
        `,
        [],

        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    erro: err.message
                });
            }

            res.json(rows);
        }
    );
});


// ==============================
// INICIAR SERVIDOR
// ==============================

app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );
});