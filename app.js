// Louvado seja o Senhor

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const port = 8081;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cimatec',
    database: 'projetoJPS_DB',
});

db.connect(function(err){
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

// CRUD dos produtos

app.post('/addProduto', (req, res) => {
    const { prodNome, prodValor, prodCategoria } = req.body;
    const query = 'insert into produtos (prodNome, prodValor, prodCategoria) values (?, ?, ?)'

    db.query(query, [prodNome, prodValor, prodCategoria], (err) => {
        if(err){
            throw new Error(`Produto não foi adicionado: ${err}`);
        }

        res.json({
          success: true,
          message: 'Produto inserido com sucesso!'  
        })
    })
});

app.get('/showProdutos', (req, res) => {
    const query = "select * from produtos order by prodNome";

    db.query(query, (err, results) => {
        if(err){
            throw new Error(`Erro de consulta: ${err}`);
        }

        res.status(200).json({ produtos: results });
    });
});

app.put('/updateProduto', (req, res) => {
    const { prodID, prodNome, prodValor, prodCategoria } = req.body;

    query = 'update produtos set prodNome = ?, prodValor = ?, prodCategoria = ? where prodID = ?';

    db.query(query, [prodNome, prodValor, prodCategoria, prodID], (err) => {
        if(err){
            throw new Error(`Erro de atualização de dados: ${err}`);
        }

        console.log("Edição realizada!");
        res.status(200).json({ message: 'Produto atualizado com sucesso!' });
    });
});

app.delete('/deleteProduto/:prodID', (req, res) => {
    const { prodID } = req.params;

    query = 'delete from produtos where prodID = ?';

    db.query(query, [prodID], (err) => {
        if(err){
            throw new Error(`Exclusão mal sucedida: ${err}`);
        }

        console.log("Exclusão realizada!");
        res.status(200).json({ message: 'Produto deletado com sucesso!' });
    })
})

// CRUD das vendas

app.post('/addNewVenda', (req, res) => {
    const { vendaDataRegistro, vendaValor, nomeComprador, tipoCompra } = req.body;

    query = 'insert into vendas (vendaDataRegistro, vendaValor, nomeComprador, tipoCompra) values (?, ?, ?, ?)';

    db.query(query, [vendaDataRegistro, vendaValor, nomeComprador, tipoCompra], (err) => {
        if(err){
            throw new Error(`Produto não foi adicionado: ${err}`);
        }

        res.json({
          success: true,
          message: 'Produto inserido com sucesso!'  
        })
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});