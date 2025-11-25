-- Louvado seja o Senhor

create database projetoJPS_DB;
use projetoJPS_DB;

create table produtos(
	prodID int not null auto_increment,
    prodNome varchar(255) not null,
    prodValor decimal(10, 2) not null,
    prodCategoria varchar(255) not null,
    Primary Key(prodID)
);

select * from produtos;