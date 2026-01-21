# 🎮 Game Marketplace API & Frontend

<div align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<br />

> 🚀 Uma plataforma Full Stack completa para compra e venda de jogos digitais, inspirada na Steam. O projeto implementa uma arquitetura robusta com separação de responsabilidades, segurança e validações de negócio complexas.

---

## 📋 Sobre o Projeto

Este projeto foi desenvolvido com o objetivo de aplicar conceitos avançados de **Engenharia de Software** na prática. Diferente de projetos CRUD simples, aqui o foco foi na integridade das transações e na experiência do usuário.

O sistema conta com um **Backend em Java (Spring Boot)** que gerencia toda a lógica de negócio, autenticação e persistência, e um **Frontend moderno em React** que consome essa API.

## 🛠️ Stack Tecnológica

### Backend (API)
* **Java 17 & Spring Boot 3:** Core da aplicação.
* **Spring Data JPA:** Camada de persistência e ORM.
* **Spring Security:** Controle de autenticação e autorização (Proteção de rotas).
* **PostgreSQL:** Banco de dados relacional.
* **Bean Validation:** Validação de DTOs e integridade de dados.

### Frontend (Client)
* **React + Vite:** Build ultra-rápido e componentização.
* **TypeScript:** Tipagem estática para maior segurança no código.
* **Tailwind CSS + Shadcn UI:** Design System moderno, responsivo e acessível.
* **Context API:** Gerenciamento de estado global (Carrinho, Autenticação).

---

## ⚙️ Arquitetura e Destaques Técnicos

### 1. Design Patterns & Boas Práticas
O backend segue uma arquitetura em camadas bem definida:
* **Controller-Service-Repository:** Separação clássica para isolar regras de negócio.
* **DTOs (Data Transfer Objects):** Uso de objetos específicos (`AddJogoRequest`, `AvaliacaoDTO`) para tráfego de dados, protegendo as entidades do banco.
* **Global Exception Handling:** Tratamento centralizado de erros (`GlobalExceptionHandler`), garantindo retornos JSON padronizados e amigáveis para o frontend.
* **Validation:** Classes dedicadas para validação de regras de negócio (`ValidadorPreco`, `ValidadorJogo`), mantendo os Services limpos.

### 2. Segurança e Integridade (ACID)
* Implementação de transações atômicas no processo de **Checkout**: ou a compra é processada por completo (baixa no saldo + adição à biblioteca), ou nada acontece.
* Histórico de compras persistente.

### 3. Frontend Moderno
* Uso de **Hooks personalizados** (`useSessionManager`, `use-toast`) para encapsular lógica.
* Interface construída com componentes reutilizáveis do **Shadcn UI** (Buttons, Cards, Dialogs).

---

## 📂 Estrutura do Projeto

O repositório é monorepo (Backend e Frontend juntos):

```bash
ProjetoPOO2/
├── src/main/java/.../       # ☕ Código Backend (Spring Boot)
│   ├── controller/          # Endpoints REST
│   ├── service/             # Regras de Negócio e Validações
│   ├── repository/          # Acesso ao Banco de Dados
│   ├── model/               # Entidades JPA
│   ├── dto/                 # Objetos de Transferência
│   └── exception/           # Tratamento de Erros
│
├── frontend-poo-main/       # ⚛️ Código Frontend (React)
│   ├── src/
│   │   ├── components/ui/   # Componentes Shadcn (Design System)
│   │   ├── contexts/        # Estado Global (Auth, Cart)
│   │   ├── pages/           # Telas (Home, Library, Cart)
│   │   └── services/        # Integração com API Java
