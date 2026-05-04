# Regras de estilo (`slang_level`)

## Níveis disponíveis

- `none`: saída neutra/formal, sem regionalismos aplicados no renderizador.
- `light` (default): comportamento atual preservado.
- `regional`: habilita substituições regionais no renderizador de texto.
- `heavy`: aplica o mesmo bloco de regionalismos de `regional` (com espaço para intensificação futura).

## Matriz de decisão

| Contexto da requisição | `slang_level` recebido | Resultado efetivo |
|---|---:|---:|
| Contexto sensível (suporte formal, cobrança, jurídico) | qualquer valor | `none` |
| Contexto não sensível | omitido | `light` |
| Contexto não sensível | `none` | `none` |
| Contexto não sensível | `light` | `light` |
| Contexto não sensível | `regional` | `regional` |
| Contexto não sensível | `heavy` | `heavy` |

## Regras de segurança contextual

Se o texto de entrada/contexto incluir termos de domínio sensível (ex.: `suporte`, `cobrança`, `jurídico`, `formal`), o pipeline força automaticamente `slang_level = none`.

## Regras do renderizador

As substituições regionais só são aplicadas quando `slang_level` for `regional` ou `heavy`.
