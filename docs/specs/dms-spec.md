# Especificação - Document Management System

## 1. Objetivo

Permitir o envio, a listagem e o download de documentos associados a um usuário, armazenando os arquivos no filesystem local da aplicação.

## 2. Escopo

### Dentro do escopo

- Enviar um documento por requisição.
- Listar os documentos associados a um usuário.
- Baixar um documento por identificador.
- Armazenar arquivos localmente com Multer e `diskStorage`.
- Manter metadados em memória nesta fase.
- Disponibilizar uma interface web para essas operações.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Banco de dados ou persistência de metadados entre reinicializações.
- Versionamento, exclusão e compartilhamento de documentos.
- Autenticação, credenciais e gestão completa de usuários.
- Upload de múltiplos arquivos por requisição.

## 3. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | O sistema deve aceitar um arquivo no campo `file` de uma requisição `multipart/form-data`. |
| RF-02 | O arquivo deve ser gravado em `backend/storage`, usando Multer com `diskStorage` e um nome interno único. |
| RF-03 | O sistema deve registrar em memória os metadados do documento enviado. |
| RF-04 | O usuário deve poder listar os documentos associados à sua identidade. |
| RF-05 | O usuário deve poder baixar um documento pelo identificador, se associado à mesma identidade. |
| RF-06 | O download deve sugerir ao navegador o nome original do arquivo. |
| RF-07 | O sistema deve informar erros para arquivo ausente, arquivo acima do limite, identidade inválida e documento indisponível. |
| RF-08 | O endpoint `GET /health` deve informar se o backend está respondendo. |
| RF-09 | A interface deve apresentar estados de carregamento, sucesso e erro e permitir iniciar downloads. |

## 4. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | Os arquivos devem ser armazenados exclusivamente no filesystem local da aplicação. |
| RNF-02 | Os metadados devem permanecer em memória e serão perdidos ao reiniciar o backend. |
| RNF-03 | O backend deve seguir o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-04 | O frontend deve acessar a API por `fetch`, usando o prefixo `/api`; em desenvolvimento, o proxy do Vite o encaminha ao backend. |
| RNF-05 | Porta, diretório de armazenamento e limite de upload devem ser configuráveis por variáveis de ambiente. |
| RNF-06 | A API não deve expor caminhos físicos de armazenamento. |
| RNF-07 | O upload deve ter limite configurável por `MAX_FILE_SIZE`, com padrão proposto de 10 MiB. |

## 5. Identidade e propriedade

As operações de documentos recebem o cabeçalho `X-User-Id`, usado para associar documentos a um identificador de usuário e filtrar listagens e downloads.

Esse cabeçalho não autentica o solicitante e pode ser falsificado. A propriedade por usuário nesta fase é apenas funcional, não uma fronteira de segurança. Uso com dados sensíveis ou em ambiente multiusuário exige autenticação e autorização, fora do escopo atual.

## 6. Modelo de dados

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | Identificador único gerado pelo servidor. |
| `originalName` | string | Nome original do arquivo enviado. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador recebido em `X-User-Id`. |

O nome e o caminho internos usados para localizar o arquivo são detalhes privados do repositório e não devem ser retornados pela API.

## 7. Contratos de API

No backend, os caminhos são os seguintes. O frontend usa o prefixo `/api`, removido pelo proxy de desenvolvimento do Vite.

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id`.
- Entrada: `multipart/form-data`, campo de arquivo `file`.
- Sucesso: `201 Created`, corpo com os metadados do documento.
- Erros: `400` para entrada inválida ou arquivo ausente; `413` para arquivo acima do limite; `500` para falha inesperada de gravação.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, lista de metadados do usuário, ordenada do mais recente para o mais antigo.
- Erro: `400` para identidade ausente ou inválida.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário com cabeçalho de download e nome original.
- Erro: `404` se o documento não existir ou não estiver associado à identidade informada; `500` para falha de leitura.

### `GET /health`

- Sucesso: `200 OK`, corpo `{ "status": "ok" }`.

As respostas de erro devem usar JSON com mensagem legível, sem expor caminhos locais ou detalhes internos.

## 8. Decisões arquiteturais e riscos

- As rotas encaminham requisições aos controllers; controllers tratam HTTP e validações básicas; services concentram regras de negócio; repositories controlam arquivos e metadados.
- Multer com `diskStorage` grava os arquivos localmente. O servidor gera um nome interno único e não usa o nome original como caminho.
- Como os metadados são voláteis, arquivos podem permanecer no disco após reinicializações sem estarem disponíveis pela API. Recuperação e limpeza desses arquivos não fazem parte do escopo.
- `X-User-Id` não oferece segurança contra falsificação de identidade.
- Não há regra de tipos de arquivo permitidos definida. O limite de tamanho é obrigatório; a definição de uma lista de tipos permitidos depende de uma decisão futura.

## 9. Plano de execução

1. **Implementar o envio:** receber e validar o arquivo, armazená-lo localmente e registrar seus metadados em memória. Critério de aceite: upload válido retorna `201` com metadados; ausência de arquivo e excesso de tamanho retornam erros apropriados.
2. **Implementar listagem:** retornar apenas os metadados associados à identidade informada, em ordem decrescente de data. Critério de aceite: a lista não inclui documentos associados a outro identificador.
3. **Implementar download:** localizar o documento, validar sua associação ao usuário e transmitir o arquivo com o nome original. Critério de aceite: documento inexistente ou de outro usuário retorna `404`; documento válido é baixado corretamente.
4. **Integrar a interface:** permitir envio, atualização da lista, apresentação de erros e download. Critério de aceite: operações disponíveis pela interface refletem os resultados da API.
5. **Verificar o sistema:** testar os contratos, os casos de erro e o endpoint de saúde; validar também a compilação do frontend. Critério de aceite: testes e build concluem sem falhas e `GET /health` retorna `200`.