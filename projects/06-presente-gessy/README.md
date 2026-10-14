# Projeto 06 — Galeria 3D da Gessy 🎂✨ (Presente de Aniversário)

Uma **galeria de arte 3D imersiva e interativa** construída com **Three.js**, hospedada **100% offline dentro da memória Flash do ESP32** (usando LittleFS com partição expandida de 2,62 MB) e exposta para qualquer lugar do mundo através do **Cloudflare Tunnel**.

Criado como um presente especial de aniversário para a **Gessy** (20 de Outubro), o projeto une computação gráfica no navegador, redes e controle físico em microcontrolador sem exigir **nenhum componente externo** — apenas a placa DevKit v1 e o cabo USB!

---

## 🎯 O que o Projeto Faz

1. **Cenário 3D Aconchegante:**
   - Salão de arte iluminado com texturas procedurais geradas em código (piso de tábuas de madeira nobre e paredes fosco-creme).
   - Molduras elegantes nas paredes exibindo as fotos do casal.
   - Corações tridimensionais flutuando suavemente pelo ar (utilizando `InstancedMesh` para consumo mínimo de GPU no celular).
   - Letreiro luminoso especial no final do salão desejando feliz aniversário.

2. **Controles Híbridos (Desktop & Smartphone):**
   - **Computador:** Teclas <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ou setas para caminhar, clique na tela para travar o cursor (*Pointer Lock*) e olhar com o mouse.
   - **Celular:** Analógico virtual na parte inferior esquerda para andar e arraste de dedo na metade direita para girar a câmera.

3. **Interação com os Quadros ("Nossa História"):**
   - Ao se aproximar e olhar para qualquer quadro, a mira central ganha destaque e surge um cartão com título, data e o botão **"💛 Nossa história"**.
   - Ao clicar, o navegador abre a página `historia.html`, exibindo a foto em alta resolução e o texto narrativo daquele dia especial.
   - Ao voltar para a galeria, a posição e o ângulo exatos da câmera são restaurados para que ela reapareça de frente para o quadro onde estava!

4. **Botão BOOT Interativo (Surpresa Física 💖):**
   - Quando você aperta o botão **BOOT (GPIO 0)** na placa física na sua bancada, o chip detecta o clique, pisca o LED do GPIO 2 e incrementa a rota `/api/surpresa`.
   - O navegador da Gessy (onde quer que ela esteja no mundo) recebe o sinal em tempo real e dispara uma **chuva mágica de corações** na tela com a mensagem *"Israel apertou o botão na placa física pensando em você!"*.

5. **Notificação de Visita em Tempo Real:**
   - Sempre que a Gessy abre uma história, a página envia um aviso para o ESP32 (`/api/visita`).
   - O chip pisca o LED e imprime no Terminal Serial:
     `[💖 VISITA DA GESSY!] Ela acabou de abrir a memória #3: "Nosso primeiro encontro"`.

6. **Contagem Regressiva e Trilha Sonora:**
   - Antes do dia 20 de Outubro, exibe uma tela com contagem regressiva em dias, horas, minutos e segundos.
   - No dia do aniversário (ou usando `?preview=1`), libera o botão para entrar e inicia automaticamente a música de fundo com controle de volume (🔊/🔇).

---

## 🛠️ Conceitos Novos e Avançados Aprendidos

### 1. Tabela de Partições Customizada (`partitions.csv`)
A memória Flash do ESP32 tem 4 MB (0x400000 bytes). Para acomodar a biblioteca Three.js, os scripts e até 15 fotos em alta definição, criamos um particionamento sob medida:

```csv
# Name,   Type, SubType, Offset,   Size
nvs,      data, nvs,     0x9000,   0x5000     (20 KB)
otadata,  data, ota,     0xe000,   0x2000     (8 KB)
app0,     app,  factory, 0x10000,  0x140000   (1.25 MB de firmware)
spiffs,   data, spiffs,  0x150000, 0x2A0000   (2.625 MB de LittleFS)
coredump, data, coredump,0x3F0000, 0x10000    (64 KB)
```

### 2. Compressão Gzip Transparente no LittleFS (`.gz`)
A biblioteca Three.js pura ocuparia ~808 KB de Flash. Comprimida em `gzip`, ela cai para apenas **~190 KB**!
No firmware C++, implementamos uma lógica onde, se o navegador pede `/vendor/three.core.min.js`, o ESP32 entrega `/vendor/three.core.min.js.gz` com o header HTTP `Content-Encoding: gzip`. O navegador descompacta na memória dele sem sobrecarregar o microcontrolador!

### 3. Raycasting e Otimização para Mobile
- Raycaster central calcula colisões de visão em tempo real para ativar as molduras.
- Materiais gerados via `<canvas>` dinâmico dispensam downloads pesados de texturas de madeira e parede.
- PixelRatio limitado a 1.5 no celular para manter 60 FPS fluídos sem esquentar o aparelho.

---

## 🚀 Como Executar

### Pré-visualização Instantânea no Navegador (Sem regravar a placa)
Criamos um simulador local em Python que roda o site e emula a API do ESP32:

```powershell
python tools\preview_presente.py
```
Abra no navegador: `http://localhost:8080/?preview=1`

---

### Gravando na Placa Física ESP32

Conecte a DevKit v1 ao cabo USB e execute no PowerShell (a partir de `projects/06-presente-gessy`):

```powershell
# 1. Compila o firmware C++
..\..\pio.cmd run

# 2. Grava a partição LittleFS de 2.62 MB com o site e fotos
..\..\pio.cmd run -t uploadfs

# 3. Grava o firmware na placa
..\..\pio.cmd run -t upload

# 4. Monitora a serial e as mensagens de visita
..\..\pio.cmd run -t monitor
```

---

## 📸 Como Colocar Suas Fotos Reais e Músicas

1. Coloque suas fotos (JPG ou PNG) em uma pasta no seu computador (ex: `C:\FotosGessy`).
2. Execute o assistente automatizado:
   ```powershell
   powershell -File .\tools\preparar_presente.ps1 -Origem "C:\FotosGessy"
   ```
   *O script ajusta a orientação EXIF, redimensiona para 1024px, otimiza o peso e calcula o espaço restante no LittleFS.*
3. Edite os títulos, datas e histórias de cada foto no arquivo:
   `projects/06-presente-gessy/data/memorias.json` *(protegido pelo `.gitignore` para sua privacidade)*.
4. Para adicionar música de fundo, salve seu arquivo MP3 em:
   `projects/06-presente-gessy/data/audio/musica.mp3` *(máximo ~450 KB)*.
5. Regrave o sistema de arquivos:
   ```powershell
   ..\..\pio.cmd run -t uploadfs
   ```

---

## 🌐 Publicando com o Cloudflare Tunnel

Para deixar a galeria online para a Gessy acessar pelo celular no 4G:

```powershell
powershell -File .\tools\iniciar_presente.ps1 -IpEsp32 "IP_DO_SEU_ESP32"
```
*O script inicia o túnel e ativa automaticamente o modo anti-suspensão do Windows para garantir que o computador permaneça acordado durante as visitas.*

