# GafiCord

**GafiCord modifica o Discord desktop já instalado.** Não é uma aplicação de chat alternativa e não utiliza Vencord, BetterDiscord, Stylus nem outro mod de cliente.

## O que faz

- Carrega o tema CSS violeta do GafiCord no Discord desktop.
- Guarda o `app.asar` original e a pasta unpacked, quando existe, antes de fazer alterações.
- Tem um comando para restaurar o cliente original.
- O carregador apenas lê um ficheiro CSS local e aplica-o às janelas do Discord. Não recolhe credenciais, tokens nem mensagens.

## Requisitos gratuitos

- Windows 10/11.
- Node.js **22.12 ou superior**: https://nodejs.org/
- Discord desktop instalado para o utilizador atual.
- Ligação à Internet apenas para descarregar este repositório e instalar a dependência `@electron/asar` através do npm.

## Instalação

1. Fecha o Discord completamente, incluindo o ícone junto ao relógio do Windows.
2. Descarrega este repositório em **Code → Download ZIP**, extrai-o e abre a pasta `GafiCord` no Terminal/PowerShell. Também podes usar Git:
   ```powershell
   git clone https://github.com/GafiPro/GafiCord.git
   cd GafiCord
   ```
3. Confirma que o Node está instalado:
   ```powershell
   node --version
   ```
   A versão deve ser `v22.12.0` ou superior.
4. Instala a dependência gratuita:
   ```powershell
   npm install
   ```
5. Instala o GafiCord:
   ```powershell
   npm run install-gaficord
   ```
6. Abre o Discord normalmente. O tema será aplicado ao carregar a interface.

O instalador deteta as versões estáveis, PTB e Canary instaladas em `%LOCALAPPDATA%`. Não termina o Discord à força; se estiver aberto, pede-te para o fechares. Se encontrar ficheiros de outro modificador (`_app.asar` ou `_app.asar.unpacked`), aborta para não os sobrescrever.

## Comandos

Ver o estado da instalação:

```powershell
npm run status
```

Restaurar o cliente original:

```powershell
npm run restore
```

A restauração só substitui o arquivo modificado se o respetivo hash corresponder ao GafiCord que foi instalado. As cópias de segurança originais ficam preservadas até à restauração.

## Personalizar o tema

Edita `themes/GafiCord.css`. Para aplicar alterações, executa novamente `npm run install-gaficord` com o Discord fechado, ou restaura e instala novamente. O tema é CSS simples, sem chamadas de rede.

Os nomes das classes e variáveis do Discord podem mudar em atualizações; nesse caso, algumas regras CSS podem ter de ser atualizadas.

## Limitações e aviso

Esta é uma modificação **não oficial** do cliente desktop. Os Termos de Serviço do Discord restringem modificações ao seu software, e alterações ao cliente podem deixar de funcionar ou causar problemas após uma atualização. Usa por tua conta e risco. A cópia de segurança e o comando `npm run restore` permitem regressar ao arquivo original.

Se o Discord deixar de iniciar, fecha todos os processos Discord e executa `npm run restore` a partir desta pasta.

## Projeto

- Código: https://github.com/GafiPro/GafiCord
- Arquivo original mantido antes da alteração: `_app.asar`
- Configuração local: `%APPDATA%\GafiCord\`
