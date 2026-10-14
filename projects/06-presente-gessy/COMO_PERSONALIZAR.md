# 📖 Guia de Personalização da Galeria 3D (Sem uso de IA)

Este guia foi feito para que você consiga alterar qualquer coisa no presente da Gessy (fotos, textos, cartinha secreta, músicas e datas) de forma 100% independente, rápida e direto no seu computador.

---

## 🗂️ Estrutura Organizada do Projeto

O projeto agora está estritamente dividido em duas partes:

```
projects/06-presente-gessy/
│
├── frontend/                   <-- AQUI VOCÊ EDITA O SITE
│   ├── index.html              <-- Estrutura da página 3D (sem scripts nem CSS embutidos)
│   ├── historia.html           <-- Página de leitura de memórias
│   ├── memorias.json           <-- ARQUIVO PRINCIPAL: configure tudo aqui!
│   ├── css/
│   │   └── estilo.css          <-- Todos os estilos, cores e fontes
│   ├── js/
│   │   ├── app.js              <-- Ponto de entrada do JavaScript
│   │   ├── galeria.js          <-- Criação do salão 3D e cenografia
│   │   ├── interacao.js        <-- Cliques nos quadros, cartinha e espelho
│   │   ├── controles.js        <-- Analógico mobile e controles de PC
│   │   └── abertura.js         <-- Contagem regressiva e música
│   ├── fotos/                  <-- COLOQUE SUAS FOTOS AQUI (01.jpg a 09.jpg)
│   └── servidor_dev.py         <-- Servidor de teste local
│
├── src/                        <-- BACKEND (C++ do ESP32)
│   └── main.cpp                <-- Servidor web e APIs na memória flash
│
├── testar_localmente.bat       <-- DUPLO CLIQUE: testa no navegador do seu PC
└── publicar_na_placa.bat       <-- DUPLO CLIQUE: grava as alterações no ESP32
```

---

## 🛠️ Passo a Passo para Fazer Alterações

### 1. Como Trocar as Fotos
1. Escolha as fotos de vocês em formato `.jpg` ou `.png`.
2. Renomeie para `01.jpg`, `02.jpg`, `03.jpg`, etc.
3. Cole na pasta: `projects/06-presente-gessy/frontend/fotos/` (substituindo as fotos anteriores).
> *Dica: fotos em orientação retrato (em pé) ou quadradas ficam perfeitas nas molduras!*

---

### 2. Como Mudar os Textos, Memórias e a Cartinha Secreta
Abra o arquivo: **`projects/06-presente-gessy/frontend/memorias.json`** no seu editor de texto (Bloco de Notas, VS Code, etc.).

Lá você encontra campos simples e diretos:
```json
{
  "aniversario": "2026-10-20T00:00:00-03:00",
  "nome_homenageada": "Gessy",
  "musica": "audio/musica.mp3",

  "carta_secreta": {
    "titulo": "Para o Amor da Minha Vida 💌",
    "subtitulo": "Feliz Aniversário, Gessy! ✨",
    "texto": "Escreva aqui a sua cartinha romântica. Pode dar Enter para quebrar parágrafos livremente!"
  },

  "memorias": [
    {
      "id": 1,
      "titulo": "O Dia em que Nos Conhecemos",
      "data": "15 de Março",
      "foto": "fotos/01.jpg",
      "texto": "Conte aqui os detalhes e o que você sentiu nesse dia especial..."
    }
  ]
}
```

---

### 3. Como Testar no Computador (Sem precisar do ESP32)
1. Dê um **duplo clique** no arquivo **`testar_localmente.bat`**.
2. O seu navegador abrirá imediatamente em `http://localhost:8000`.
3. Tudo funciona exatamente igual:
   - Você anda com W, A, S, D ou com o mouse.
   - Abre os quadros, a cartinha e o espelho mágico.
   - Pode enviar recados no formulário (eles são salvos localmente e impressos no terminal).
4. Enquanto a tela estiver aberta, faça as alterações que quiser nos arquivos e **aperte F5 no navegador** para ver na hora!

---

### 4. Como Gravar na Placa Física ESP32
Quando você terminar de ajustar tudo e achar que ficou perfeito:
1. Conecte o ESP32 no cabo USB do computador.
2. Dê um **duplo clique** no arquivo **`publicar_na_placa.bat`**.
3. O script fará tudo sozinho:
   - Sincroniza a pasta `frontend` para a pasta `data`.
   - Grava a memória flash do chip ESP32 via `uploadfs`.
   - Pronto! O presente já estará atualizado para ela acessar pelo túnel público Cloudflare ou no Wi-Fi.

