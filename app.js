// Louvado seja o Senhor

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const port = 8081;

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cimatec',
    database: 'projetoJPS_DB',
});

conn.connect(function(err){
    if(err){
        console.error(`Connection error: ${err}`);
        return;
    }

    console.log('Connected to the DB');
});

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/addProduto', (req, res) => {
    const { nomeProduto, valorProduto, categoriaProduto } = req.body;
        const sql = 'insert into produtos (prodNome, prodValor, prodCategoria) values (?, ?, ?)'

    conn.query(sql, [nomeProduto, valorProduto, categoriaProduto], (err) => {
        if(err){
            throw new Error(`Produto não foi adicionado: ${err}`);
        }

        res.json({
          success: true,
          message: 'Produto inserido com sucesso!'  
        })
    })
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});