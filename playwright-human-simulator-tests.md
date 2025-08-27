# 🎯 PROTOCOLO DE TESTES HUMANOS - VITE/NEXT.JS
> IA deve agir como usuário real explorando o sistema

## 🚀 FASE 1: DESCOBERTA INICIAL
1. **Acesse** → `browser_navigate` para URL do projeto
2. **Observe** → `browser_snapshot` - analise layout/cores/design
3. **Explore** → Role a página, observe elementos visuais
4. **Critique** → "Essas cores combinam? O design está agradável?"

## 🔍 FASE 2: NAVEGAÇÃO EXPLORATÓRIA  
5. **Clique em tudo** → `browser_click` em TODOS links do menu
6. **Volte** → `browser_navigate_back` após cada página
7. **Teste hover** → `browser_hover` em botões/imagens
8. **Procure bugs** → Links quebrados? Elementos sobrepostos?

## 👤 FASE 3: FLUXO DE AUTENTICAÇÃO
9. **Cadastro** → Clique em "Criar conta" ou similar
10. **Invente dados** → Nome falso, email temporário
11. **Preencha** → `browser_fill_form` com dados variados
12. **Erre de propósito** → Senha fraca, email inválido
13. **Corrija** → Observe validações e mensagens de erro
14. **Confirme** → Complete o cadastro com sucesso

## 🔐 FASE 4: LOGIN E DASHBOARDS
15. **Login comum** → Entre como usuário normal
16. **Explore dashboard** → Clique em TODAS opções do menu
17. **Tente quebrar** → Ações não permitidas, limites
18. **Saia** → Faça logout completo
19. **Login admin** → Tente acessar área administrativa
20. **Teste permissões** → O que admin pode fazer?

## 💳 FASE 5: FLUXO DE COMPRA
21. **Navegue produtos** → Browse como cliente real
22. **Adicione ao carrinho** → Múltiplos itens
23. **Remova itens** → Teste alterações no carrinho
24. **Cupom falso** → Digite código inválido
25. **Checkout** → Preencha dados de pagamento
26. **Cartão teste** → 4242 4242 4242 4242
27. **Finalize** → Complete a compra

## ✉️ FASE 6: VALIDAÇÃO OTP/EMAIL
28. **Procure OTP** → Check console/logs para código
29. **Digite errado** → Teste código incorreto primeiro
30. **Digite certo** → Valide com código correto
31. **Reenvie** → Teste botão "Reenviar código"

## 🎮 FASE 7: INTERAÇÕES AVANÇADAS
32. **Formulários complexos** → Upload de arquivos com `browser_file_upload`
33. **Filtros** → Teste todos dropdowns com `browser_select_option`
34. **Busca** → Digite termos variados, teste autocomplete
35. **Modais** → Abra/feche popups, teste ESC key
36. **Drag & drop** → `browser_drag` se houver

## 🐛 FASE 8: TESTE DE ESTRESSE
37. **Duplo clique rápido** → `doubleClick: true` em botões
38. **Spam de requisições** → Clique múltiplo em "Salvar"
39. **Campos gigantes** → Digite 1000 caracteres em inputs
40. **Timeout** → Espere respostas com `browser_wait_for`

## 📊 FASE 9: VALIDAÇÃO FINAL
41. **Screenshot geral** → `browser_take_screenshot` de páginas principais
42. **Console errors** → `browser_console_messages` para ver erros JS
43. **Network** → `browser_network_requests` para APIs lentas
44. **Responsivo** → `browser_resize` para mobile/tablet/desktop
45. **Cross-browser** → Repita em Chrome/Firefox/Safari

## ♿ FASE 10: ACESSIBILIDADE
46. **Tab navigation** → `browser_press_key('Tab')` em toda página
47. **Skip to content** → Procure links de pulo de navegação  
48. **ARIA labels** → `browser_evaluate` para checar aria-label
49. **Contraste** → Screenshot e analise cores (WCAG 2.1)
50. **Screen reader** → Teste com NVDA/JAWS simulado

## ⚡ FASE 11: PERFORMANCE & MÉTRICAS  
51. **Core Web Vitals** → `browser_evaluate` para medir LCP < 2.5s
52. **First Input Delay** → Clique e meça resposta (FID < 100ms)
53. **Memory profiling** → `browser_evaluate(() => performance.memory)`
54. **CPU throttling** → Simule CPU 4x slower, teste interações
55. **Bundle size** → Check network tab para JS > 500kb

## 🌍 FASE 12: INTERNACIONALIZAÇÃO (i18n) (quando implementado)
56. **Switch language** → Procure seletor de idiomas, teste PT/EN/ES
57. **Formatos regionais** → Data (DD/MM vs MM/DD), moeda (R$ vs $)
58. **Traduções quebradas** → Textos cortados, overflow em buttons
59. **RTL support** → Se aplicável, teste árabe/hebraico
60. **Fallback language** → Force idioma inexistente, veja fallback

## 📈 MÉTRICAS DE SUCESSO
✅ Cobertura: 60 testes totais (45 originais + 15 novos)
⏱️ Performance: LCP < 2.5s | FID < 100ms | CLS < 0.1
♿ Acessibilidade: WCAG 2.1 AA | Tab navigation completa
🌍 i18n: Mínimo 3 idiomas testados | Formatos regionais validados
📊 Report final: Gerar dashboard com todos os resultados

## ⚠️ REPORTAR SEMPRE:
✅ Funcionalidades que passaram
❌ Bugs encontrados (com screenshots)
⚠️ Melhorias de UX sugeridas
🎨 Problemas visuais/design
⏱️ Lentidões (> 3 segundos)

## 🎯 COMPORTAMENTO HUMANO:
• **Hesitar** → Mova mouse antes de clicar
• **Errar** → Digite errado e delete às vezes
• **Pensar** → Pause 1-2s antes de decisões
• **Explorar** → Tente caminhos não óbvios
• **Frustrar** → Reaja a bugs como usuário real