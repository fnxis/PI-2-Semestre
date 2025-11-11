CREATE DATABASE revisauto;

USE revisauto;

CREATE TABLE cad_cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo_pessoa VARCHAR(2) NOT NULL, -- 'PF' ou 'PJ'
    
    cpf CHAR(11) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE,
    cnpj CHAR(14) UNIQUE,
    insc_estadual VARCHAR(20),
    insc_municipal VARCHAR(20),
    telefone VARCHAR(15),
    telefone_obs VARCHAR(100), 
    celular VARCHAR(15),
    celular_obs VARCHAR(100),
    email VARCHAR(100),
    email_obs VARCHAR(100), 
    rua VARCHAR(100), 
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    uf CHAR(2),
    cep CHAR(9),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cad_veiculo (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_cliente INT NOT NULL, 
    placa CHAR(7) NOT NULL UNIQUE,
    renavam CHAR(11),
    marca VARCHAR(30),
    modelo VARCHAR(30),
    ano INT,
    cor VARCHAR(20),
    chassi CHAR(17) UNIQUE,
    combustivel VARCHAR(20),
    categoria VARCHAR(20),
    observacoes TEXT,
    FOREIGN KEY (fk_id_cliente) REFERENCES cad_cliente(id_cliente)
);

CREATE TABLE checklist (
    id_checklist INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(7),
    dono VARCHAR(100),
    observacoes TEXT,
    itens TEXT, 
    fotos TEXT,
    criado_em DATETIME
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL
);

INSERT INTO usuarios(usuario,senha) VALUES("guilherme",22022007);
INSERT INTO usuarios(usuario,senha) VALUES("leonardo",30032003);