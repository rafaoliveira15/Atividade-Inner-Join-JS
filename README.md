# 📊 Dashboard de Coleta de Dados Web

> Aplicação full-stack para monitoramento e scraping de sites, com armazenamento em SQLite, extração de dados via Regex + Cheerio e visualização em dashboard interativo.

---

<div align="center">

# 🧾 Sumário

<p align="center">

<a href="#-sobre-o-projeto">
  <img src="https://img.shields.io/badge/Sobre%20o%20Projeto-8A2BE2?style=for-the-badge&logo=readme&logoColor=white">
</a>

<a href="#-demonstração">
  <img src="https://img.shields.io/badge/Demonstração-8A2BE2?style=for-the-badge&logo=vercel&logoColor=white">
</a>

<a href="#-tecnologias-utilizadas">
  <img src="https://img.shields.io/badge/Tecnologias%20Utilizadas-8A2BE2?style=for-the-badge&logo=visualstudiocode&logoColor=white">
</a>

<a href="#-arquitetura">
  <img src="https://img.shields.io/badge/Arquitetura-8A2BE2?style=for-the-badge&logo=codefactor&logoColor=white">
</a>

<a href="#-estrutura-do-banco-de-dados">
  <img src="https://img.shields.io/badge/Banco%20de%20Dados-8A2BE2?style=for-the-badge&logo=sqlite&logoColor=white">
</a>

<a href="#-rotas-da-api">
  <img src="https://img.shields.io/badge/Rotas%20da%20API-8A2BE2?style=for-the-badge&logo=fastapi&logoColor=white">
</a>

<a href="#-pré-requisitos">
  <img src="https://img.shields.io/badge/Pré--requisitos-8A2BE2?style=for-the-badge&logo=windows-terminal&logoColor=white">
</a>

<a href="#-instalação-e-execução">
  <img src="https://img.shields.io/badge/Instalação%20e%20Execução-8A2BE2?style=for-the-badge&logo=node.js&logoColor=white">
</a>

<a href="#-como-usar">
  <img src="https://img.shields.io/badge/Como%20Usar-8A2BE2?style=for-the-badge&logo=github&logoColor=white">
</a>

</p>

</div>

---

## 📌 Sobre o Projeto

O **Dashboard de Coleta de Dados Web** é uma aplicação que permite cadastrar sites e realizar coletas automatizadas de informações públicas, como contagem de links, imagens, títulos, e-mails e palavras-chave mais frequentes.

Os dados coletados são armazenados em um banco de dados **SQLite** local e exibidos em tempo real em um dashboard HTML com tabelas interativas.

Este projeto foi desenvolvido com fins educacionais para demonstrar na prática o uso das seguintes tecnologias: **Node.js**, **Express**, **Axios**, **Cheerio**, **SQLite3** e **Regex**.

---

## 🎬 Demonstração

```
Usuário cadastra um site → Clica em "Coletar Dados" → O servidor acessa a URL,
extrai informações com Cheerio e Regex → Salva no SQLite → Dashboard atualiza
```

**Dados coletados por coleta:**
- 🔗 Total de links (`<a>`)
- 🖼️ Total de imagens (`<img>`)
- 📝 Total de títulos (`<h1>`, `<h2>`, `<h3>`)
- 📧 Total de e-mails (via Regex)
- 🔤 Total de palavras (via Regex)
- 🏆 Top 5 palavras mais frequentes

---

## 🛠️ Tecnologias Utilizadas

### Back-end
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| [Node.js](https://nodejs.org/) | LTS | Runtime JavaScript server-side |
| [Express](https://expressjs.com/) | ^5.2.1 | Framework web para criação de APIs REST |
| [Axios](https://axios-http.com/) | ^1.16.0 | Cliente HTTP para buscar o conteúdo dos sites |
| [Cheerio](https://cheerio.js.org/) | ^1.2.0 | Parser e manipulador de HTML (estilo jQuery) |
| [SQLite3](https://www.npmjs.com/package/sqlite3) | ^6.0.1 | Banco de dados relacional leve e embarcado |
| [CORS](https://www.npmjs.com/package/cors) | ^2.8.6 | Middleware para liberar acesso cross-origin |

### Front-end
| Tecnologia | Descrição |
|------------|-----------|
| HTML5 | Estrutura da interface |
| CSS3 | Estilização com cards, tabelas e responsividade |
| JavaScript (Vanilla) | Consumo da API via `fetch`, manipulação do DOM |

---

## 🏗️ Arquitetura

```
projeto-dashboard/
│
├── server.js          # Servidor Express + rotas da API + lógica de scraping
├── banco.db           # Banco de dados SQLite (gerado automaticamente)
├── package.json       # Dependências e metadados do projeto
│
└── public/            # (recomendado: mover arquivos front-end para cá)
    ├── index.html     # Interface do usuário
    ├── script.js      # Lógica front-end (fetch, DOM)
    └── style.css      # Estilos da aplicação
```

### Fluxo de dados

```
[Navegador] ──POST /sites──────────────────► [Express API]
                                                   │
[Navegador] ──POST /coletar/:id──────────────►     │
                                               [Axios GET site]
                                                   │
                                               [Cheerio parse HTML]
                                                   │
                                               [Regex extração]
                                                   │
                                               [SQLite INSERT]
                                                   │
[Navegador] ◄──JSON response─────────────────      │

[Navegador] ──GET /dashboard─────────────────►[SQLite SELECT JOIN]
[Navegador] ──GET /palavras──────────────────►[SQLite SELECT JOIN]
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `sites`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Identificador único (autoincremento) |
| `nome` | TEXT | Nome amigável do site |
| `url` | TEXT | Endereço completo do site |
| `segmento` | TEXT | Categoria (ex: Educação, Tecnologia) |

### Tabela `coletas`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Identificador único |
| `site_id` | INTEGER FK | Referência ao site coletado |
| `data_coleta` | TEXT | Data e hora da coleta (formato pt-BR) |
| `total_links` | INTEGER | Quantidade de links encontrados |
| `total_imagens` | INTEGER | Quantidade de imagens |
| `total_titulos` | INTEGER | Quantidade de h1/h2/h3 |
| `total_emails` | INTEGER | Quantidade de e-mails encontrados |
| `total_palavras` | INTEGER | Total de palavras com 4+ caracteres |

### Tabela `palavras_chave`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER PK | Identificador único |
| `coleta_id` | INTEGER FK | Referência à coleta |
| `palavra` | TEXT | Palavra encontrada |
| `quantidade` | INTEGER | Frequência de aparição |

### Diagrama de relacionamento (simplificado)

```
sites (1) ──── (N) coletas (1) ──── (N) palavras_chave
```

---

## 🔌 Rotas da API

Base URL: `http://localhost:3000`

| Método | Rota | Descrição | Body |
|--------|------|-----------|------|
| `POST` | `/sites` | Cadastra um novo site | `{ nome, url, segmento }` |
| `GET` | `/sites` | Lista todos os sites cadastrados | — |
| `POST` | `/coletar/:id` | Executa a coleta de dados do site pelo ID | — |
| `GET` | `/dashboard` | Retorna todas as coletas com dados do site | — |
| `GET` | `/palavras` | Retorna as palavras-chave coletadas por site | — |

### Exemplo de requisição — Cadastrar site

```bash
curl -X POST http://localhost:3000/sites \
  -H "Content-Type: application/json" \
  -d '{"nome": "G1", "url": "https://g1.globo.com", "segmento": "Notícias"}'
```

### Exemplo de resposta

```json
{
  "mensagem": "Site cadastrado com sucesso!",
  "id": 1
}
```

---

## ✅ Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [npm](https://www.npmjs.com/) (já vem com o Node.js)
- Acesso à internet (para que o servidor consiga acessar as URLs dos sites)

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/projeto-dashboard.git
cd projeto-dashboard
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor

```bash
node server.js
```

Saída esperada:
```
Servidor rodando em http://localhost:3000
```

### 4. Acesse no navegador

Abra o arquivo `index.html` diretamente no navegador **ou** mova os arquivos de front-end para uma pasta `public/` na raiz do projeto para que sejam servidos pelo Express.

> ⚠️ **Atenção:** o arquivo `index.html` usa `fetch` para `http://localhost:3000`. Certifique-se de que o servidor esteja rodando antes de abrir a página.

---

## 📖 Como Usar

1. **Cadastrar um site:** Preencha o nome, a URL completa (com `https://`) e o segmento, então clique em **Cadastrar Site**.

2. **Coletar dados:** Na seção "Sites Cadastrados", clique em **Coletar Dados** ao lado do site desejado. O servidor irá acessar a URL e extrair as informações automaticamente.

3. **Ver o dashboard:** Clique em **Atualizar Dashboard** para visualizar todas as coletas realizadas, com as métricas de cada uma.

4. **Ver palavras-chave:** Clique em **Carregar Palavras** para ver o ranking das palavras mais encontradas em cada site.

---

## Autora

**Rafaela Oliveira** 💙

Estudante de Desenvolvimento de Sistemas  
