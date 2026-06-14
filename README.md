# Calculadora de IMC

**Disciplina:** Programacao para Dispositivos Moveis em Android  
**Professor:** Julio Cartier  
**Aluno(s):** _(seu nome aqui)_

---

## Problema social abordado

O excesso de peso e o sedentarismo estao entre os principais problemas de saude publica no Brasil. Grande parte da populacao, especialmente jovens, nao acompanha o proprio peso de forma regular e, quando o faz, nao sabe interpretar os numeros nem o que fazer a partir deles.

Este aplicativo foi desenvolvido com o objetivo de facilitar esse acompanhamento. Alem de calcular o Indice de Massa Corporal, o app apresenta orientacoes praticas baseadas no resultado e armazena um historico de medicoes para que o usuario possa acompanhar sua evolucao ao longo do tempo.

---

## Tecnologias utilizadas

- React Native com Expo
- React Navigation (Bottom Tab Navigator)
- Dexie.js para persistencia de dados local via IndexedDB

---

## Funcionalidades

**Tela Calcular**  
O usuario insere peso e altura. O app calcula o IMC, exibe o resultado com a classificacao correspondente e salva o registro automaticamente no banco de dados.

**Tela Dicas**  
Exibe cinco orientacoes de saude personalizadas de acordo com a faixa do IMC calculado.

**Tela Historico**  
Lista todos os registros salvos com data e hora. O usuario pode editar ou excluir qualquer registro individualmente, ou limpar todo o historico de uma vez.

---

## Operacoes CRUD implementadas

Create: novo registro salvo ao calcular o IMC.  
Read: historico carregado automaticamente via useLiveQuery.  
Update: edicao de peso e altura de um registro existente.  
Delete: exclusao individual ou total dos registros.

---

## Como rodar o projeto

**Pre-requisitos**

- Node.js instalado na maquina
- Expo CLI instalado globalmente (`npm install -g expo-cli`)
- Aplicativo Expo Go instalado no celular (disponivel na App Store e Play Store)

**Instalacao**

```bash
git clone https://github.com/SEU_USUARIO/IMCApp.git
cd IMCApp
npm install dexie dexie-react-hooks
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo start
```

Apos iniciar, escaneie o QR code com o aplicativo Expo Go para visualizar o projeto no celular.
