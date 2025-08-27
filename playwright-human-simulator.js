import { chromium } from 'playwright';
import fs from 'fs';

// Teoria dos Grafos - Mapeamento de navegação
class NavigationGraph {
  constructor() {
    this.nodes = new Map(); // páginas/elementos
    this.edges = new Map(); // conexões/links
    this.visited = new Set();
    this.discoveries = [];
  }

  addNode(id, data) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, {
        id,
        ...data,
        visitCount: 0,
        firstVisit: new Date(),
        interactions: []
      });
    }
  }

  addEdge(from, to, action) {
    const edgeId = `${from}->${to}`;
    if (!this.edges.has(edgeId)) {
      this.edges.set(edgeId, {
        from,
        to,
        action,
        traversals: 0
      });
    }
    this.edges.get(edgeId).traversals++;
  }

  markVisited(nodeId, interaction) {
    this.visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (node) {
      node.visitCount++;
      node.interactions.push({
        timestamp: new Date(),
        type: interaction
      });
    }
  }

  getUnvisitedNeighbors(nodeId) {
    const neighbors = [];
    for (const [edgeId, edge] of this.edges) {
      if (edge.from === nodeId && !this.visited.has(edge.to)) {
        neighbors.push(edge.to);
      }
    }
    return neighbors;
  }

  recordDiscovery(discovery) {
    this.discoveries.push({
      timestamp: new Date(),
      ...discovery
    });
  }
}

// Simulação de comportamento humano
class HumanSimulator {
  constructor(page, graph) {
    this.page = page;
    this.graph = graph;
    this.currentNode = 'homepage';
    this.attentionSpan = 3000; // tempo médio em cada elemento
    this.curiosityLevel = 0.8; // probabilidade de explorar
    this.fatigueLevel = 0;
    this.mouseSpeed = 'natural'; // movimento natural do mouse
  }

  // Simula movimento natural do mouse
  async naturalMouseMove(x, y) {
    const currentPosition = await this.page.evaluate(() => ({
      x: window.mouseX || 0,
      y: window.mouseY || 0
    }));

    const steps = 20;
    const deltaX = (x - currentPosition.x) / steps;
    const deltaY = (y - currentPosition.y) / steps;

    for (let i = 0; i < steps; i++) {
      const nextX = currentPosition.x + deltaX * i;
      const nextY = currentPosition.y + deltaY * i;
      
      // Adiciona pequenas variações para parecer mais natural
      const variance = 2;
      const finalX = nextX + (Math.random() - 0.5) * variance;
      const finalY = nextY + (Math.random() - 0.5) * variance;
      
      await this.page.mouse.move(finalX, finalY);
      await this.wait(10 + Math.random() * 20);
    }
  }

  // Simula tempo de reação humano
  async wait(ms) {
    const variance = ms * 0.2;
    const actualWait = ms + (Math.random() - 0.5) * variance;
    await this.page.waitForTimeout(Math.max(actualWait, 0));
  }

  // Simula leitura de texto
  async readText(selector) {
    const text = await this.page.textContent(selector).catch(() => '');
    const readingTime = text.length * 50; // 50ms por caractere
    await this.wait(Math.min(readingTime, 5000));
    return text;
  }

  // Simula scroll humano
  async humanScroll() {
    const scrollHeight = await this.page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await this.page.evaluate(() => window.innerHeight);
    
    let currentScroll = 0;
    while (currentScroll < scrollHeight - viewportHeight) {
      const scrollAmount = 100 + Math.random() * 200;
      await this.page.mouse.wheel(0, scrollAmount);
      await this.wait(500 + Math.random() * 1000);
      
      currentScroll += scrollAmount;
      
      // Chance de parar para ler algo interessante
      if (Math.random() < 0.3) {
        await this.wait(2000 + Math.random() * 3000);
      }
    }
  }

  // Explora elementos interativos
  async exploreInteractiveElements() {
    const elements = await this.page.$$eval('button, a, input, [role="button"], [onclick]', els => 
      els.map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent?.trim() || '',
        href: el.href || '',
        type: el.type || '',
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        rect: el.getBoundingClientRect()
      }))
    );

    const visibleElements = elements.filter(el => el.visible);
    
    for (const element of visibleElements) {
      // Adiciona ao grafo
      const nodeId = `${element.tag}-${element.text || element.type}`.replace(/\s+/g, '-');
      this.graph.addNode(nodeId, element);
      this.graph.addEdge(this.currentNode, nodeId, 'discovered');

      // Decide se interage baseado na curiosidade
      if (Math.random() < this.curiosityLevel * (1 - this.fatigueLevel)) {
        // Hover sobre o elemento
        if (element.rect.x && element.rect.y) {
          await this.naturalMouseMove(
            element.rect.x + element.rect.width / 2,
            element.rect.y + element.rect.height / 2
          );
          await this.wait(500 + Math.random() * 1000);

          // Chance de clicar
          if (element.tag === 'button' || (element.tag === 'a' && !element.href.includes('http'))) {
            if (Math.random() < 0.3) {
              this.graph.recordDiscovery({
                type: 'interaction',
                element: nodeId,
                action: 'click'
              });
            }
          }
        }
      }

      // Aumenta fadiga
      this.fatigueLevel = Math.min(this.fatigueLevel + 0.01, 0.9);
    }

    return visibleElements;
  }

  // Simula comportamento de curiosidade
  async exhibitCuriosity() {
    // Verifica tooltips
    const hasTooltips = await this.page.$$('[title], [data-tooltip], [aria-describedby]');
    for (const element of hasTooltips.slice(0, 3)) {
      const box = await element.boundingBox();
      if (box) {
        await this.naturalMouseMove(box.x + box.width / 2, box.y + box.height / 2);
        await this.wait(1000);
      }
    }

    // Tenta expandir elementos colapsáveis
    const expandables = await this.page.$$('[aria-expanded="false"], details:not([open])');
    for (const expandable of expandables.slice(0, 2)) {
      if (Math.random() < 0.5) {
        await expandable.click();
        await this.wait(1500);
        this.graph.recordDiscovery({
          type: 'expansion',
          element: await expandable.evaluate(el => el.textContent?.slice(0, 50))
        });
      }
    }
  }

  // Navega seguindo o grafo
  async navigateGraph() {
    const unvisited = this.graph.getUnvisitedNeighbors(this.currentNode);
    
    if (unvisited.length > 0) {
      // Escolhe próximo nó baseado em curiosidade
      const nextNode = unvisited[Math.floor(Math.random() * unvisited.length)];
      this.currentNode = nextNode;
      this.graph.markVisited(nextNode, 'navigation');
      
      return true;
    }
    
    return false;
  }

  // Executa simulação completa
  async runSimulation(duration = 60000) {
    const startTime = Date.now();
    
    console.log('🤖 Iniciando Human Simulator com Teoria dos Grafos...');
    
    while (Date.now() - startTime < duration) {
      // Marca página atual
      const url = this.page.url();
      const title = await this.page.title();
      this.graph.addNode(url, { title, type: 'page' });
      this.graph.markVisited(url, 'page-visit');

      // Explora elementos
      await this.exploreInteractiveElements();
      
      // Exibe curiosidade
      await this.exhibitCuriosity();
      
      // Scroll humano
      await this.humanScroll();
      
      // Tira screenshot periódico
      if (Math.random() < 0.2) {
        const screenshotName = `human-sim-${Date.now()}.png`;
        await this.page.screenshot({ 
          path: `.playwright-mcp/${screenshotName}`,
          fullPage: true 
        });
        this.graph.recordDiscovery({
          type: 'screenshot',
          file: screenshotName,
          url
        });
      }

      // Decide próxima ação
      if (!await this.navigateGraph()) {
        // Se não há mais nós para visitar, volta ao início
        await this.page.goto('http://localhost:5001');
        this.currentNode = 'homepage';
        this.fatigueLevel = Math.max(0, this.fatigueLevel - 0.3);
      }

      // Pausa para "descanso"
      if (this.fatigueLevel > 0.7) {
        console.log('😴 Simulando pausa para descanso...');
        await this.wait(5000);
        this.fatigueLevel = 0.3;
      }
    }

    return this.graph;
  }
}

// Execução principal
async function main() {
  console.log('🚀 Iniciando teste Human Simulator...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  const graph = new NavigationGraph();
  const simulator = new HumanSimulator(page, graph);
  
  // Navega para homepage
  await page.goto('http://localhost:5001', { waitUntil: 'networkidle' });
  
  // Executa simulação por 2 minutos
  const result = await simulator.runSimulation(120000);
  
  // Salva resultados
  const report = {
    timestamp: new Date().toISOString(),
    nodes: Array.from(result.nodes.values()),
    edges: Array.from(result.edges.values()),
    discoveries: result.discoveries,
    statistics: {
      totalNodes: result.nodes.size,
      totalEdges: result.edges.size,
      nodesVisited: result.visited.size,
      totalDiscoveries: result.discoveries.length
    }
  };
  
  fs.writeFileSync(
    'human-simulator-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Simulação completa!');
  console.log(`📊 Estatísticas:`);
  console.log(`   - Nós descobertos: ${report.statistics.totalNodes}`);
  console.log(`   - Conexões mapeadas: ${report.statistics.totalEdges}`);
  console.log(`   - Elementos visitados: ${report.statistics.nodesVisited}`);
  console.log(`   - Descobertas registradas: ${report.statistics.totalDiscoveries}`);
  
  await browser.close();
}

main().catch(console.error);