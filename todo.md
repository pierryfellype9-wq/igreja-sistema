# Igreja Sites - TODO

## Infraestrutura e Configuração
- [x] Inicializar projeto com banco de dados e autenticação
- [x] Configurar schema do banco de dados (usuários, visitantes, orações, sorteios, avisos, escalas, arquivos)
- [x] Implementar sistema de autenticação com login/senha para membros
- [ ] Configurar S3 para armazenamento de arquivos
- [ ] Implementar sistema de notificações por email

## Site Interno (Restrito)
- [x] Página de login com autenticação
- [x] Dashboard interno com menu de navegação
- [x] Seção de avisos internos (CRUD)
- [x] Seção de escalas (CRUD)
- [ ] Área de arquivos com upload/download de PDFs e documentos
- [x] Painel de visualização de visitantes com senha de acesso
- [x] Painel de visualização de pedidos de oração com senha de acesso
- [ ] Painel de visualização de sorteios com senha de acesso
- [ ] Gerenciamento de usuários e permissões

## Site Público - Visitantes
- [x] Página de formulário de visitante
- [x] Validação e armazenamento de dados
- [x] Confirmação de envio
- [ ] Painel de visualização com autenticação por senha

## Site Público - Pedidos de Oração
- [x] Página de formulário de pedido de oração
- [x] Validação e armazenamento de dados
- [x] Confirmação de envio
- [ ] Painel de visualização com autenticação por senha

## Site Público - Sorteios
- [x] Página de formulário de participação em sorteio
- [x] Validação e armazenamento de dados
- [x] Confirmação de envio
- [ ] Painel de visualização com autenticação por senha

## Design e UX
- [x] Design minimalista sem cores fortes
- [x] Layout mobile-first responsivo
- [x] Sem animações ou efeitos visuais pesados
- [x] Tipografia clara e legível
- [x] Formulários simples e intuitivos

## Notificações e Integrações
- [ ] Sistema de notificação por email ao administrador (visitantes)
- [ ] Sistema de notificação por email ao administrador (pedidos de oração)
- [ ] Sistema de notificação por email ao administrador (sorteios)
- [ ] Configuração de templates de email

## Testes e Qualidade
- [x] Testes unitários para procedimentos tRPC
- [ ] Testes de autenticação
- [ ] Testes de validação de formulários
- [ ] Testes de notificações por email

## Deploy e Documentação
- [ ] Documentação de setup e configuração
- [ ] Instruções de deploy em subdomínios
- [ ] Guia de manutenção e operação
