create database projetoJPS_DB;
use projetoJPS_DB;

create table produtos(
	prodID int not null auto_increment,
    prodNome varchar(255) not null,
    prodValor decimal(10, 2) not null,
    prodCategoria varchar(255) not null,
    Primary Key(prodID)
);

create table vendas(
	vendaID int not null auto_increment,
	vendaDataRegistro Date not null,
    vendaValor decimal(10, 2) not null,
    nomeComprador varchar(255),
    tipoCompra enum("credito", "debito", "dinheiro", "pix", "fiado") not null,
    Primary Key(vendaID)
);