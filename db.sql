-- Louvado seja o Senhor

create database projetoJPS_DB;
use projetoJPS_DB;

create table usuarios(
	userID int not null auto_increment,
    userNome varchar(255) not null,
    userSenha varchar(255) not null,
    userTipo enum("admin", "user") not null,
    Primary Key(userID, userNome)
);

insert into usuarios(userNome, userSenha, userTipo) values ("JPSAdmin", "Jps290271@", "admin");

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
    tipoCompra enum("credito", "debito", "dinheiro", "pix", "divida") not null,
    Primary Key(vendaID)
);

create table clientes(
	clienteID int not null auto_increment,
    clienteNome varchar(255) not null,
    clienteDivida decimal(10, 2) not null,
    Primary Key(clienteID)
);

create table registroDividas(
	regDividasID int not null auto_increment,
    valorDivida decimal(10, 2) not null,
    dataDivida Date not null,
    clienteID_FK int not null,
    vendaID_FK int not null,
    
    Primary Key(regDividasID),
    Foreign Key(clienteID_FK) references clientes(clienteID),
    Foreign Key(vendaID_FK) references vendas(vendaID)
);

create table pagamentoDividas(
	pagDividasID int not null auto_increment,
    valorPagamento decimal(10, 2) not null,
    dataPagamento Date not null,
    clienteID_FK int not null,
    
    Primary Key(pagDividasID),
    Foreign Key(clienteID_FK) references clientes(clienteID)
);

-- Triggers da table vendas

delimiter $$
create trigger registroFiadoTrigger 
after insert
on vendas
for each row
begin
	declare cliente_id int;
	if new.tipoCompra = 'divida' then
		select clienteID into cliente_id from clientes where clienteNome = new.nomeComprador;
		
		if cliente_id is not null then
			insert into registroDividas(valorDivida, dataDivida, clienteID_FK, vendaID_FK) 
            values (new.vendaValor, new.vendaDataRegistro, cliente_id, new.vendaID);
		else
			insert into clientes (clienteNome, clienteDivida) values (new.nomeComprador, 0);
			select clienteID into cliente_id from clientes where clienteNome = new.nomeComprador;
			insert into registroDividas(valorDivida, dataDivida, clienteID_FK, vendaID_FK) 
            values (new.vendaValor, new.vendaDataRegistro, cliente_id, new.vendaID);
		end if;
	end if;
end; 
$$ delimiter ;

delimiter $$
create trigger atualizacaoRegistroFiadoTrigger
before update
on vendas
for each row
begin
	declare regdividas_id int;
    declare cliente_id int;
    select regDividasID into regdividas_id from registroDividas where vendaID_FK = new.vendaID;
    
	if new.tipoCompra = 'divida' then
		if new.nomeComprador = old.nomeComprador then
			update registroDividas 
            set valorDivida = new.vendaValor, dataDivida = new.vendaDataRegistro 
			where regDividasID = regdividas_id;
		else
			delete from registroDividas where regDividasID = regdividas_id;
            
            select clienteID into cliente_id from clientes where clienteNome = new.nomeComprador;
			
			if cliente_id is not null then
				insert into registroDividas(valorDivida, dataDivida, clienteID_FK, vendaID_FK) 
				values (new.vendaValor, new.vendaDataRegistro, cliente_id, new.vendaID);
			else
				insert into clientes (clienteNome, clienteDivida) values (new.nomeComprador, 0);
				select clienteID into cliente_id from clientes where clienteNome = new.nomeComprador;
				insert into registroDividas(valorDivida, dataDivida, clienteID_FK, vendaID_FK) 
				values (new.vendaValor, new.vendaDataRegistro, cliente_id, new.vendaID);
			end if;
        end if;
	else
		delete from registroDividas where regDividasID = regdividas_id;
	end if;
end;
$$ delimiter ;

delimiter $$
create trigger exclusaoRegistroFiadoTrigger
before delete
on vendas
for each row
begin
    declare regdividas_id int;
    
    select regDividasID into regdividas_id from registroDividas where vendaID_FK = old.vendaID;
    
    delete from registroDividas where regDividasID = regdividas_id;
end;
$$ delimiter ;

-- Triggers da table registroDividas

delimiter $$
create trigger atualizacaoDividaTrigger
before insert
on registroDividas
for each row
begin
	declare cliente_id int;
	set cliente_id = new.clienteID_FK;
	
	update clientes set clienteDivida = clienteDivida + new.valorDivida where clienteID = cliente_id;
end;
$$ delimiter ;

delimiter $$
create trigger alteracaoRegistroDividaTrigger
after update 
on registroDividas
for each row
begin
	declare cliente_id int;
    declare cliente_divida decimal(10, 2);
    
	set cliente_id = new.clienteID_FK;
    
    select clienteDivida into cliente_divida from clientes where clienteID = cliente_id;
    set cliente_divida = cliente_divida - old.valorDivida;
    set cliente_divida = cliente_divida + new.valorDivida;
    
    update clientes set clienteDivida = cliente_divida where clienteID = cliente_id;
end;
$$ delimiter ;

delimiter $$
create trigger exclusaoRegistroDividaTrigger
before delete
on registroDividas
for each row
begin
	declare clienteid_fk int;
    declare cliente_divida decimal(10, 2);
    
    set clienteid_fk = old.clienteID_FK;
    select clienteDivida into cliente_divida from clientes where clienteID = clienteid_fk;
    
    update clientes set clienteDivida = cliente_divida - old.valorDivida where clienteID = clienteid_fk;
end;
$$ delimiter ;

-- Triggers da table pagamentoDividas

delimiter $$
create trigger atualizacaoPagamentoDividaTrigger
before insert
on pagamentoDividas
for each row
begin
	declare cliente_id int;
    declare cliente_divida decimal(10, 2);
    
	set cliente_id = new.clienteID_FK;
    
    select clienteDivida into cliente_divida from clientes where clienteID = cliente_id;
    set cliente_divida = cliente_divida - new.valorPagamento;
    
	update clientes set clienteDivida = cliente_divida where clienteID = cliente_id;
end;
$$ delimiter ;

delimiter $$
create trigger alteracaoPagamentoDividaTrigger
after update 
on pagamentoDividas
for each row
begin
	declare cliente_id int;
    declare cliente_divida decimal(10, 2);
    
	set cliente_id = new.clienteID_FK;
    
    select clienteDivida into cliente_divida from clientes where clienteID = cliente_id;
    set cliente_divida = cliente_divida + old.valorPagamento;
    set cliente_divida = cliente_divida - new.valorPagamento;
    
	update clientes set clienteDivida = cliente_divida where clienteID = cliente_id;

end;
$$ delimiter ;

delimiter $$
create trigger exclusaoPagamentoDividaTrigger
before delete
on pagamentoDividas
for each row
begin
	declare clienteid_fk int;
    declare cliente_divida decimal(10, 2);
    
    set clienteid_fk = old.clienteID_FK;
    select clienteDivida into cliente_divida from clientes where clienteID = clienteid_fk;
    
    update clientes set clienteDivida = cliente_divida + old.valorPagamento where clienteID = clienteid_fk;
end;
$$ delimiter ;

-- Triggers da table clientes

delimiter $$
create trigger exclusaoClienteTrigger
before delete
on clientes
for each row
begin
    delete from registroDividas where regDividasID > 0 and clienteID_FK = old.clienteID;
end;
$$ delimiter ;

INSERT INTO vendas (vendaDataRegistro, vendaValor, nomeComprador, tipoCompra) VALUES
('2025-01-05', 150.75, 'Carlos Almeida', 'credito'),
('2025-01-06', 89.90, 'Mariana Souza', 'debito'),
('2025-01-07', 230.00, 'João Pedro', 'pix'),
('2025-01-08', 49.50, 'Ana Clara', 'dinheiro'),
('2025-01-09', 310.20, 'Ricardo Lima', 'credito'),
('2025-01-10', 15.00, 'Cliente Não Informado', 'dinheiro'),
('2025-01-11', 780.99, 'Pedro Henrique', 'debito'),
('2025-01-12', 120.00, 'Fernanda Gomes', 'pix'),
('2025-01-13', 45.10, 'Lucas Martins', 'dinheiro'),
('2025-01-14', 999.99, 'Paula Beatriz', 'credito'),
('2025-01-15', 12.00, 'Joana Oliveira', 'divida'),
('2025-01-16', 200.00, 'Roberto Carlos', 'debito'),
('2025-01-17', 350.40, 'Patrícia Mendes', 'credito'),
('2025-01-18', 18.75, 'Marcos Vinícius', 'dinheiro'),
('2025-01-19', 520.00, 'Julia Andrade', 'pix'),
('2025-01-20', 73.20, 'Thiago Santos', 'debito'),
('2025-01-21', 640.00, 'Sofia Ribeiro', 'credito'),
('2025-01-22', 27.90, 'Gabriel Monteiro', 'dinheiro'),
('2025-01-23', 1500.00, 'Empresa XPTO', 'pix'),
('2025-01-24', 65.30, 'Cliente Desconhecido', 'divida'),
(CurDate(), 100, "Jonah", "divida");