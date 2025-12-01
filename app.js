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
    password: '2006Pa#*#',
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

// Auth

app.post('/login', (req, res) => {
    const { userNome, userSenha } = req.body;

    query = 'select * from usuarios where userNome = ? and userSenha = ? limit 1';

    db.query(query, [userNome, userSenha], (err, results) => {
        if(err){
            throw new Error(`Erro de consulta: ${err}`);
        }

        if(results.length > 0){
            console.log(results.affectedRows);
            res.status(200).json({ usuario: results });
        }
        else{
            res.status(401).json({ message: 'Usuário não encontrado' });
        }
    })
})

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

    query = 'insert into vendas (nomeComprador, vendaValor, vendaDataRegistro, tipoCompra) values (?, ?, ?, ?)';

    db.query(query, [nomeComprador, vendaValor, vendaDataRegistro, tipoCompra], (err) => {
        if(err){
            throw new Error(`Venda não foi adicionada: ${err}`);
        }

        res.json({
          success: true,
          message: 'Produto inserido com sucesso!'  
        })
    });
});

app.get('/showVendas', (req, res) => {
    query = 'select * from vendas where tipoCompra != "fiado" order by vendaDataRegistro desc';

    db.query(query, (err, results) => {
        if(err){
            throw new Error(`Erro na exibição dos produtos: ${err}`);
        }

        res.status(200).json({ vendas: results });
    });
});

app.get('/showDividas', (req, res) => {
    query = 'select * from vendas where tipoCompra = "fiado" order by vendaDataRegistro desc';

    db.query(query, (err, results) => {
        if(err){
            throw new Error(`Erro na exibição dos produtos: ${err}`);
        }

        res.status(200).json({ dividas: results });
    });
});

app.put('/updateVenda/:vendaID', (req, res) => {
    const { vendaID } = req.params;
    const { vendaDataRegistro, vendaValor, nomeComprador, tipoCompra } = req.body;

    query = 'update vendas set vendaDataRegistro = ?, vendaValor = ?, nomeComprador = ?, tipoCompra = ? where vendaID = ?';

    db.query(query, [vendaDataRegistro, vendaValor, nomeComprador, tipoCompra, vendaID], (err) => {
        if(err){
            throw new Error(`Erro na atualização: ${err}`);
        }

        res.status(200).json({ message: 'Atualização efetuada' });
    })
})

app.delete('/deleteVenda/:vendaID', (req, res) => {
    const { vendaID } = req.params;

    query = 'delete from vendas where vendaID = ?';

    db.query(query, [vendaID], (err) => {
        if(err){
            throw new Error(`Erro na exclusão: ${err}`);
        }

        res.status(200).json({ message: 'Exclusão efetuada' });
    })
})

// CRUD dos clientes

app.get('/showClientes', (req, res) => {
    query = 'select * from clientes';

    db.query(query, (err, results) => {
        if(err){
            throw new Error(`Erro na consulta: ${err}`);
        }

        res.status(200).json({ clientes: results });
    });
});

app.get('/showClienteInfo/:clienteID', (req, res) => {
    const { clienteID } = req.params;

    query = 'select * from clientes where clienteID = ?';

    db.query(query, [clienteID], (err, results) => {
        if(err){
            throw new Error(`Erro na consulta: ${err}`);
        }

        res.status(200).json({ clienteInfo: results });
    });
})

app.get('/showClienteRegistroDividas/:clienteID_FK', (req, res) => {
    const { clienteID_FK } = req.params;

    query = 'select * from registroDividas where clienteID_FK = ?';

    db.query(query, [clienteID_FK], (err, results) => {
        if(err){
            throw new Error(`Erro na consulta: ${err}`);
        }

        res.status(200).json({ registroDividas: results });
    });
});

app.get('/showClientePagamentoDividas/:clienteID_FK', (req, res) => {
    const { clienteID_FK } = req.params;

    query = 'select * from pagamentoDividas where clienteID_FK = ?';

    db.query(query, [clienteID_FK], (err, results) => {
        if(err){
            throw new Error(`Erro na consulta: ${err}`);
        }

        res.status(200).json({ pagamentoDividas: results });
    });
});

app.post('/pagarDivida', (req, res) => {
    const { valorPagamento, clienteID_FK } = req.body;

    query = 'insert into pagamentoDividas(valorPagamento, dataPagamento, clienteID_FK) values (?, curdate(), ?)';

    db.query(query, [valorPagamento, clienteID_FK], (err) => {
        if(err){
            throw new Error(`Erro na criação do registro: ${err}`);
        }

        res.status(200).json({ message: 'Registro criado!' });
    });
});

app.put('/updateRegistroDivida/:regDividaID/:clienteID_FK', (req, res) => {
    const { regDividaID, clienteID_FK } = req.params;
    const { valorDivida, dataDivida } = req.body;

    query = 'update registroDividas set valorDivida = ?, dataDivida = ? where regDividasID = ? and clienteID_FK = ?';

    db.query(query, [valorDivida, dataDivida, regDividaID, clienteID_FK], (err) => {
        if(err){
            throw new Error(`Erro de atualização: ${err}`);
        }

        res.status(200).json({ message: "Atualização efetuada!" });
    })
})

app.put('/updatePagamentoDivida/:pagDividaID/:clienteID_FK', (req, res) => {
    const { pagDividaID, clienteID_FK } = req.params;
    const { valorPagamento, dataPagamento } = req.body;

    query = 'update pagamentoDividas set valorPagamento = ?, dataPagamento = ? where pagDividasID = ? and clienteID_FK = ?';

    db.query(query, [valorPagamento, dataPagamento, pagDividaID, clienteID_FK], (err) => {
        if(err){
            throw new Error(`Erro de atualização: ${err}`);
        }

        res.status(200).json({ message: "Atualização efetuada!" });
    })
})

app.delete('/deleteRegistroDivida/:regDividasID/:clienteID_FK', (req, res) => {
    const { regDividasID, clienteID_FK } = req.params;

    query = 'delete from registroDividas where regDividasID = ? and clienteID_FK = ?';

    db.query(query, [regDividasID, clienteID_FK], (err) => {
        if(err){
            throw new Error(`Erro na exclusão: ${err}`);
        }

        res.status(200).json({ message: 'Exclusão efetuada!' })
    })
})

app.delete('/deletePagamentoDivida/:pagDividasID/:clienteID_FK', (req, res) => {
    const { pagDividasID, clienteID_FK } = req.params;

    query = 'delete from pagamentoDividas where pagDividasID = ? and clienteID_FK = ?';

    db.query(query, [pagDividasID, clienteID_FK], (err) => {
        if(err){
            throw new Error(`Erro na exclusão: ${err}`);
        }

        res.status(200).json({ message: 'Exclusão efetuada!' })
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});