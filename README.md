# ShowCinex | Comparador de Algoritmos de Busca

Aplicação web desenvolvida para a disciplina de **Algoritmos e Estrutura de Dados II** do curso de **Engenharia de Software** da **UniAlfa**. O projeto consiste em um sistema de catálogo de filmes que compara o desempenho e a velocidade de diferentes metodologias de busca utilizando um banco de dados local baseado em arquivos JSON.

---

## Sobre o Projeto

O **ShowCinex** foi criado para demonstrar na prática o impacto computacional de diferentes estratégias de busca de dados. Utilizando um dataset de **5.000 filmes** obtidos da API do TMDB (The Movie Database) e divididos em 19 gêneros, a aplicação mede e exibe o tempo de resposta e a eficiência de cada abordagem:

* **Busca Sequencial (Linear):** Percorre o array de ponta a ponta até encontrar o registro.
* **Busca Indexada:** Utiliza estruturas de índice para acelerar o acesso aos dados em blocos específicos.
* **Busca Hash:** Utiliza tabelas hash para acesso direto aos elementos em tempo constante na maioria dos casos O(1).

*Nota: Ferramentas de IA foram utilizadas como suporte durante o processo de desenvolvimento.*

---

## Funcionalidades

* **Painel de Comparação:** Gráficos e métricas de tempo de execução entre busca sequencial, indexada e hash.
* **Catálogo de Filmes:** Navegação por 5.000 títulos distribuídos em 19 gêneros diferentes.
* **Filtros e Consultas Rápidas:** Teste prático de performance digitando buscas em tempo real.
* **Interface Moderna:** Design responsivo e limpo com ícones dinâmicos.

---

## Tecnologias Utilizadas

* **React** (com Vite / Create React App)
* **Lucide React** (para ícones modernos e limpos)
* **Tailwind CSS** (estilização e layout)
* **React Router DOM** (gerenciamento de rotas)
* **JSON Local** (base de dados com 5.000 filmes do TMDB)

---

## Pré-requisitos

Certifique-se de ter o **Node.js** e o **npm** (ou yarn) instalados em sua máquina.

---

## Como Executar

1. **Clone este repositório:**
   ```bash
   git clone [https://github.com/Execatsu/ShowCinex.git](https://github.com/Execatsu/Facul-ShowCinex-Buscas.git)
   ```
2. **Acesse a pasta do projeto:**
   ```bash
   cd Facul-ShowCinex-Buscas
   ```
3. **Instale as dependências:**
   ```bash
   npm install
   ```
4. Execute a aplicação:
   ```bash
   npm run dev
   ```
   (ou *npm start*, dependendo de como configurou o projeto)

---

## Contexto Acadêmico
Instituição: Centro Universitário Alves Faria (UniAlfa)

Curso: Engenharia de Software

Disciplina: Algoritmos e Estrutura de Dados II

Autor: Cássius Fernando Lopes Ribeiro

---

## Licença
Este projeto está sob a licença MIT. Sinta-se à vontade para usá-lo e estudá-lo!
