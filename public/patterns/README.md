# Padrões / Texturas — Meta Consultoria

Padrões de fundo extraídos do slide guide. Use com **opacidade reduzida** (10–25%) ou em áreas decorativas — nunca como fundo principal de conteúdo legível.

| Arquivo | Descrição | Uso |
|---|---|---|
| `triangles-bg.png`        | Triângulos low-poly em fundo navy | Heros, capas de seção, fundos institucionais |
| `triangles-light.png`     | Mesmo padrão em fundo claro (paper) | Versão clara, fundos de cards |
| `halftone-triangles.png`  | Meio-tom de mini triângulos        | Borda decorativa lateral, esquinas |
| `network-fullscreen.png`  | Rede de pontos/linhas em fundo navy | Fundo de slide inteiro, hero secundário |
| `network-bottom.png`      | Rede só na parte inferior          | Rodapé com estilo |
| `network-corner.png`      | Rede no canto superior direito     | Cabeçalhos, slides "evento" |
| `waves.png`               | Ondas finas em fundo navy          | Slide de transição, fundo de citação |

### Boas práticas

- **Não use como fundo de texto longo** — sempre como acento decorativo.
- Combine com `--meta-navy` ou `--meta-paper` como fundo base.
- Para fundo de seção em CSS:
  ```css
  background:
    linear-gradient(rgba(19,25,54,0.85), rgba(19,25,54,0.85)),
    url('patterns/triangles-bg.png') center/cover;
  ```
- Os padrões NÃO se repetem perfeitamente (não são tileable). Use `cover` ou `contain`.
