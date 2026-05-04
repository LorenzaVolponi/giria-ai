# Guia de Tom por Canal, Região e Situações Sensíveis

Este guia define padrões de comunicação para o produto **Gíria AI** em diferentes canais, regiões e cenários de risco.

## 1) Tom por canal

### Chat (app/site)
- **Tom-base:** direto, acolhedor, didático e sem julgamento.
- **Objetivo:** explicar significado, contexto e alternativa formal de forma curta.
- **Estilo recomendado:** frases curtas, exemplos práticos, evitar ambiguidades.
- **Tempo verbal:** presente e imperativo leve (ex.: “Você pode usar…”).
- **Limites:** não incentivar humilhação, discriminação, automedicação ou fraude.

**Exemplo aprovado**
- “No contexto informal, ‘slay’ costuma indicar elogio entusiasmado. Em contexto profissional, prefira ‘excelente trabalho’.”

### Push (notificações)
- **Tom-base:** objetivo, positivo e orientado à ação.
- **Objetivo:** gerar retorno ao app sem manipulação emocional.
- **Tamanho:** curto (ideal até ~80 caracteres quando possível).
- **Limites:** sem urgência artificial (“última chance!”) para temas sensíveis.

**Exemplo aprovado**
- “Nova explicação disponível para sua gíria favorita. Confira no app.”

### E-mail
- **Tom-base:** claro, cordial e estruturado.
- **Objetivo:** comunicar atualização, orientação ou confirmação com contexto.
- **Estrutura mínima:** assunto objetivo, abertura cordial, mensagem principal, CTA.
- **Limites:** evitar jargão excessivo e promessas absolutas.

**Exemplo aprovado**
- Assunto: “Atualizamos seu guia de expressões”
- Corpo: “Olá! Incluímos novas sugestões de linguagem formal para facilitar seu uso em estudos e trabalho.”

### Suporte
- **Tom-base:** empático, responsável e orientado à resolução.
- **Objetivo:** reconhecer a dor do usuário e informar próximo passo.
- **Estratégia:** validar sentimento + explicar ação + definir prazo.
- **Limites:** nunca culpar usuário; nunca minimizar reclamação.

**Exemplo aprovado**
- “Entendo a frustração e obrigado por avisar. Já registramos o incidente e retornaremos até 24h com atualização.”

---

## 2) Diretrizes regionais: exemplos aprovados e termos a evitar

> Regra geral: preservar clareza e respeito, evitando reforço de estereótipos locais.

### Brasil (geral)
**Exemplos aprovados**
- “Beleza, vamos traduzir isso para um contexto mais formal.”
- “No dia a dia, essa expressão indica surpresa positiva.”

**Termos a evitar**
- “Coisa de gente ignorante.”
- “Fala direito.”
- Generalizações de classe/região/etnia.

### Portugal (pt-PT)
**Exemplos aprovados**
- “Posso adaptar a expressão para um registo mais formal.”
- “Neste contexto, significa entusiasmo ou aprovação.”

**Termos a evitar**
- Tratamento excessivamente infantilizado (“fofinho”, “amiguinho”) em suporte.
- Expressões que soem ofensivas por variação regional.

### Comunidades lusófonas (África/diáspora)
**Exemplos aprovados**
- “A interpretação pode variar por país; aqui está uma opção neutra.”
- “Se quiser, adapto para um contexto académico/profissional.”

**Termos a evitar**
- “Português correto é só um.”
- Qualquer desqualificação de variantes locais.

### Regra de fallback quando região é desconhecida
- Usar português neutro, evitar regionalismo forte e perguntar preferência:
  - “Prefere adaptação para português do Brasil ou de Portugal?”

---

## 3) Regras para situações sensíveis

## Reclamação
- Abrir com empatia objetiva (“Entendo”, “Obrigado por reportar”).
- Não discutir culpa; focar fatos e solução.
- Informar prazo e canal de retorno.

**Modelo**
- “Sinto muito pelo ocorrido. Já acionamos o time responsável e retornaremos até [prazo] com atualização.”

## Cobrança/pagamento
- Linguagem neutra e verificável (valor, data, método, protocolo).
- Evitar ameaça, constrangimento ou tom coercitivo.
- Fornecer caminhos: segunda via, contestação, suporte.

**Modelo**
- “Identificamos pendência de pagamento em [data]. Posso enviar segunda via ou abrir contestação agora.”

## Saúde e bem-estar
- Não fornecer diagnóstico médico, posologia, ou substituir profissional.
- Incentivar busca de atendimento qualificado quando houver risco.
- Em urgência, orientar serviço local de emergência.

**Modelo**
- “Não posso oferecer diagnóstico médico. Se houver risco imediato, procure o serviço de emergência da sua região agora.”

## Segurança, autoagressão e violência
- Priorizar proteção do usuário e desescalada.
- Não oferecer instruções de dano.
- Direcionar para ajuda imediata/local.

**Modelo**
- “Sinto muito que você esteja passando por isso. Se houver risco imediato, procure ajuda de emergência local agora.”

## Discriminação e discurso de ódio
- Bloquear normalização de conteúdo ofensivo.
- Responder com limite claro + alternativa segura.

**Modelo**
- “Não posso ajudar com linguagem ofensiva contra grupos. Posso ajudar a reformular para um diálogo respeitoso.”

---

## 4) Versionamento do guia e revisão obrigatória em PR

## Versionamento
- Este guia deve seguir versionamento semântico interno:
  - **MAJOR:** mudança de princípios de segurança/tom.
  - **MINOR:** novos canais, regiões, cenários ou políticas.
  - **PATCH:** ajustes editoriais, exemplos e clareza.

## Registro de versão
- Manter no topo do PR:
  - Versão anterior → nova versão.
  - Resumo das mudanças.
  - Impacto esperado em UX/suporte/moderação.

## Regra para novas gírias
- Toda inclusão de nova gíria deve passar por revisão de PR com checklist:
  1. Contexto de uso validado.
  2. Risco de ambiguidade/ofensa avaliado.
  3. Alternativa formal revisada.
  4. Exemplo por canal revisado (quando aplicável).
  5. Região/variante linguística considerada.

## Política de aprovação
- PR com novas gírias **exige ao menos 1 aprovação humana** de responsável por conteúdo/segurança.
- Em caso de divergência regional, prevalece versão neutra até consenso.
