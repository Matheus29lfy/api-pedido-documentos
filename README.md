Markdown
# API de Integração de Pedidos e Documentos

Esta API gerencia o ciclo de vida de pedidos de exames e a vinculação de documentos clínicos, garantindo a integridade dos dados através de regras de negócio de integração assíncrona.

## 🚀 Tecnologias Utilizadas

- **Framework:** NestJS (v10)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (via Docker ou Local)
- **ORM:** TypeORM
- **Testes:** Jest

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (v18 ou superior)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/pt/)
- [Docker](https://www.docker.com/) (opcional, para o banco de dados)

## 🔧 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   git clone <url-do-seu-repositorio>
   cd api-pedido-documentos
Instale as dependências:

Bash
npm install
Configuração do Ambiente:
Crie um arquivo .env na raiz do projeto com as credenciais do seu banco de dados local:

Snippet de código
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=nome_do_banco
Rodando o Banco com Docker (Opcional):
Se preferir usar o Docker para o banco:

Bash
docker-compose up -d db
🏃 Executando a Aplicação
Para iniciar o servidor em modo de desenvolvimento (com hot-reload):

Bash
npm run start:dev
A API estará disponível em http://localhost:3000.

🧪 Executando os Testes
O projeto conta com uma suíte de testes unitários que garantem a integridade das regras de negócio de cada módulo.

Rodar todos os testes:
Bash
npm test
Rodar testes de um módulo específico:
Bash
# Apenas Pedidos
npx jest src/modules/orders/orders.service.spec.ts

# Apenas Documentos
npx jest src/modules/documents/documents.service.spec.ts

# Apenas Exames
npx jest src/modules/exams/exams.service.spec.ts
📖 Principais Regras de Negócio Implementadas
Unicidade de AccessionNumber: Garantida via banco de dados para evitar duplicidade entre pedidos.

Integração Retroativa: Se um documento chega antes do pedido de exame, o sistema o vincula automaticamente assim que o pedido é criado.

Idempotência: O reenvio do mesmo pedido/exame não gera duplicidade no banco.

Tratamento de Conflitos: Respostas HTTP 409 para tentativas de vincular dados já existentes.

🛠️ Endpoints da API
A API segue o padrão REST e utiliza os seguintes endpoints para a operação do sistema:

📦 Pedidos (Orders)
POST /pedidos: Cria um novo pedido ou atualiza um existente. Se novos exames forem enviados no corpo da requisição, eles serão adicionados ao pedido respeitando a unicidade do CodigoItemPedido.

GET /pedidos/:codigoPedido: Retorna os detalhes de um pedido específico, incluindo a lista de exames vinculados e o status de integração.

📄 Documentos (Documents)
POST /documentos: Recebe e processa um novo documento. O sistema tenta vinculá-lo imediatamente a um pedido existente. Caso o pedido não exista ou não esteja integrado, o documento permanece com status pendente até que a regra de integração seja disparada.

GET /documentos/:codigoPedido: Lista todos os documentos associados a um determinado pedido.

Exames (Exams)
GET /exames/:accessionNumber

Descrição: Consulta rápida para verificar o status atual de um exame e se ele já possui um pedido vinculado.

Resposta: Retorna os detalhes do exame, modalidade e o status da integração com o pedido pai.

POST /exames (Simulação de Chegada / Regra 4)

Descrição: Endpoint que simula a chegada do exame vindo do laboratório ou sistema de execução.

Corpo da Requisição (Payload):

JSON
{
  "CodigoItemPedido": 8,
  "AccessionNumber": "ABC-128",
  "Modalidade": "RX",
  "NomeProcedimento": "RAIO-X TORAX"
}
Regras de Negócio Aplicadas:

Vínculo com Pedido: O sistema busca automaticamente um pedido que contenha este AccessionNumber.

Ativação de Integração: Se o pedido for encontrado, ele é marcado imediatamente como integrado: true.

Processamento Retroativo: Caso existam documentos pendentes para este pedido, o sistema realiza a vinculação automática no momento da chegada do exame.

Resiliência (Assincronismo): Se o exame chegar antes do pedido ser criado, os dados são persistidos e o sistema aguarda a criação do pedido correspondente para completar o fluxo.

## 🧠 Decisões Técnicas & Premissas

1. **Abordagem de Integração (Regra 4):** Optei por uma lógica resiliente onde o sistema valida a existência do pedido no momento da chegada do exame. Caso o exame chegue primeiro, ele é registrado para garantir a integridade, e o vínculo é completado na criação do pedido (Assincronismo).
2. **Idempotência:** Implementei verificações para que múltiplos envios do mesmo `CodigoItemPedido` ou `AccessionNumber` não gerem duplicidade ou estados inconsistentes.
3. **Estratégia de Testes:** Foquei em Testes Unitários para os Services, cobrindo as regras de negócio mais complexas (como a vinculação retroativa de documentos).
4. **Banco de Dados:** Utilizei restrições de `UNIQUE` no banco de dados como última linha de defesa para a integridade dos `AccessionNumbers`.
