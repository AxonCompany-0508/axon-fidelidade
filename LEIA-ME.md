# Axon Fidelidade — Passo 1: Calculadora de CMV

Esta pasta é um site completo e pronto para o ar. Não usa banco de dados, não
tem login e não guarda nada em servidor nenhum. É só a calculadora.

**O que você vai fazer aqui:** colocar essa pasta no GitHub, conectar na Vercel
e ter um endereço na internet para mandar para dono de restaurante.

Tempo: uns 15 minutos.

---

## Antes de tudo: coloque o seu WhatsApp

Abra o arquivo **`src/lib/config.ts`** e troque o número da primeira linha:

```
export const WHATSAPP = "5514999999999";
```

Formato: **55 + DDD + número, só dígitos.**
Para (14) 99123-4567 fica `"5514991234567"`.

Se esquecer disso, o botão do WhatsApp na página não vai chegar em você.

---

## Passo 1 — Criar o repositório no GitHub

1. Entre em **github.com** e clique em **New** (botão verde, canto superior direito)
2. Nome do repositório: `axon-fidelidade`
3. Marque **Private**
4. **NÃO** marque "Add a README file" — deixe tudo desmarcado
5. Clique em **Create repository**

Vai abrir uma tela dizendo que o repositório está vazio.

---

## Passo 2 — Subir os arquivos

1. Nessa tela, clique no link **uploading an existing file**
   (fica na frase "…or upload an existing file")
2. Descompacte o arquivo `axon-fidelidade.zip` no seu computador
3. Abra a pasta descompactada
4. Selecione **tudo que está dentro dela** e arraste para a área do GitHub

   > Atenção: arraste o **conteúdo** da pasta, não a pasta em si.
   > Você deve estar arrastando `package.json`, `src`, `tailwind.config.ts` e os outros.

5. Espere terminar de subir (aparece a lista de arquivos)
6. Clique em **Commit changes** no fim da página

---

## Passo 3 — Conectar na Vercel

1. Entre em **vercel.com** com a mesma conta que você já usa
2. Clique em **Add New… → Project**
3. Ache `axon-fidelidade` na lista e clique em **Import**
4. **Não mexa em nada** na tela que aparece. Não precisa de variável de
   ambiente, não precisa configurar build.
5. Clique em **Deploy**

Espere uns 2 minutos. No fim ela mostra o endereço do site, algo como
`axon-fidelidade.vercel.app`.

---

## Pronto

Esse endereço é o que você manda no WhatsApp para dono de restaurante.

Quando você quiser mudar alguma coisa (o número do WhatsApp, um texto),
edite o arquivo direto pelo site do GitHub e a Vercel publica sozinha em
2 minutos.

---

## O que tem nesta pasta

| Arquivo | Para que serve |
|---|---|
| `src/lib/config.ts` | **Seu WhatsApp.** É o único que você precisa editar. |
| `src/lib/cmv.ts` | Toda a matemática e as faixas de CMV de cada ramo |
| `src/components/Calculadora.tsx` | A calculadora em si |
| `src/components/Marca.tsx` | O logo (a chama) |
| `src/app/page.tsx` | A página: título, chamada e rodapé |
| `src/app/globals.css` | Estilos base |
| `tailwind.config.ts` | As cores da marca |

Os outros arquivos são configuração e você não precisa abrir.
