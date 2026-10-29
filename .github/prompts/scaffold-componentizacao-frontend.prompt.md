---
description: Cria componentes visuais parar as telas do frontend.
name: scaffold-componentizacao
argument-hint: nome do recurso (ex. documents)
agent: agent
---

# Scaffold de camada do frontend

Crie os componentes visuais na pasta `frontend/src/components/${input:recurso}`.

Gere os arquivos em `backend/src` e os componentes visuais em `frontend/src/components/${input:recurso}`:

1. `routes/${input:recurso}.routes.js` - define os endpoints e delega ao controller.
2. `controllers/${input:recurso}.controller.js` - trata entrada/saída HTTP e validação básica.
3. `services/${input:recurso}.service.js` - concentra as regras de negócio.
4. `repositories/${input:recurso}.repository.js` - cuida da persistência.

Requisitos:

- Respeite o fluxo `routes -> controllers -> services -> repositories`.
- Uploads gravados no filesystem local via multer com diskStorage.
- Metadados em memória nesta fase.
- Trate erros nos limites do sistema.
