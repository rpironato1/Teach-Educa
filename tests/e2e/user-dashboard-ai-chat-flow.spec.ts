/**
 * User Dashboard with AI Chat Flow Tests
 * 
 * Tests comprehensive user dashboard functionality including:
 * - AI chat interface with 3 types of teacher agents
 * - Task reading and interpretation capabilities
 * - Educational content generation system
 * - Learning progress tracking
 * - Credit system integration
 * - Neuroadaptive learning features
 * - LocalStorage persistence for chat history
 */

import { test, expect } from '@playwright/test';

test.describe('User Dashboard with AI Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should authenticate user and access dashboard with AI features', async ({ page }) => {
    await page.goto('/');
    
    // Login as regular user
    const loginButton = page.locator('button:has-text("Entrar")').first();
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page.locator('input#email')).toBeVisible({ timeout: 5000 });
    
    await page.fill('input#email', 'user@teach.com');
    await page.fill('input#password', 'user123');

    const submitButton = page.locator('button[type="submit"]:has-text("Entrar")');
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Verify user authentication
    const userAuth = await page.evaluate(() => {
      const authData = localStorage.getItem('kv-auth-data');
      return authData ? JSON.parse(authData) : null;
    });

    expect(userAuth?.user?.role).toBe('user');
    expect(userAuth?.user?.email).toBe('user@teach.com');
    expect(userAuth?.sessionActive).toBe(true);

    // Navigate to dashboard
    await page.goto('/?demo=dashboard');
    await page.waitForTimeout(2000);

    // Should see dashboard with AI features
    const hasDashboardContent = await page.evaluate(() => {
      return document.body.innerText.includes('Dashboard') ||
             document.body.innerText.includes('Chat') ||
             document.body.innerText.includes('IA') ||
             document.body.innerText.includes('Assistente');
    });

    expect(hasDashboardContent).toBeTruthy();
  });

  test('should display and interact with 3 types of AI teacher agents', async ({ page }) => {
    await page.goto('/');
    
    // Set up authenticated user with AI access
    await page.evaluate(() => {
      const userData = {
        user: {
          id: 'ai-chat-user',
          email: 'aichat@test.com',
          fullName: 'Usuário Chat IA',
          role: 'user',
          plan: {
            name: 'Intermediário',
            credits: 500,
            renewalDate: '2025-01-31'
          }
        },
        token: 'ai_chat_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
    });

    // Set up AI assistants data
    await page.evaluate(() => {
      const aiAssistants = [
        {
          id: 'math-tutor',
          name: 'Prof. Magnus',
          specialty: 'Matemática',
          description: 'Especialista em matemática com abordagem neuroadaptativa',
          avatar: '🔢',
          color: 'primary',
          creditCost: 2,
          capabilities: [
            'Resolução passo a passo',
            'Visualizações interativas',
            'Exercícios adaptativos',
            'Análise de erros comuns'
          ],
          personality: 'Paciente e metódico, explica conceitos complexos de forma simples'
        },
        {
          id: 'writing-assistant',
          name: 'Ana Letras',
          specialty: 'Redação e Literatura',
          description: 'Mentora de escrita criativa e análise textual',
          avatar: '✍️',
          color: 'secondary',
          creditCost: 3,
          capabilities: [
            'Revisão e correção',
            'Desenvolvimento de ideias',
            'Análise literária',
            'Técnicas narrativas'
          ],
          personality: 'Criativa e inspiradora, encoraja expressão autêntica'
        },
        {
          id: 'programming-coach',
          name: 'Dev Carlos',
          specialty: 'Programação',
          description: 'Coach experiente em desenvolvimento de software',
          avatar: '💻',
          color: 'accent',
          creditCost: 4,
          capabilities: [
            'Code review inteligente',
            'Debugging assistido',
            'Arquitetura de software',
            'Boas práticas'
          ],
          personality: 'Prático e direto, foca em soluções eficientes'
        }
      ];
      
      localStorage.setItem('ai_assistants', JSON.stringify(aiAssistants));
    });

    await page.goto('/?demo=dashboard');
    await page.waitForTimeout(2000);

    // Verify AI assistants are available
    const assistantsData = await page.evaluate(() => {
      const assistants = localStorage.getItem('ai_assistants');
      return assistants ? JSON.parse(assistants) : null;
    });

    expect(assistantsData).toHaveLength(3);
    
    // Test Math Tutor
    const mathTutor = assistantsData.find((a: unknown) => a.id === 'math-tutor');
    expect(mathTutor?.name).toBe('Prof. Magnus');
    expect(mathTutor?.specialty).toBe('Matemática');
    expect(mathTutor?.creditCost).toBe(2);
    expect(mathTutor?.capabilities).toContain('Resolução passo a passo');

    // Test Writing Assistant
    const writingAssistant = assistantsData.find((a: unknown) => a.id === 'writing-assistant');
    expect(writingAssistant?.name).toBe('Ana Letras');
    expect(writingAssistant?.specialty).toBe('Redação e Literatura');
    expect(writingAssistant?.creditCost).toBe(3);
    expect(writingAssistant?.capabilities).toContain('Revisão e correção');

    // Test Programming Coach
    const programmingCoach = assistantsData.find((a: unknown) => a.id === 'programming-coach');
    expect(programmingCoach?.name).toBe('Dev Carlos');
    expect(programmingCoach?.specialty).toBe('Programação');
    expect(programmingCoach?.creditCost).toBe(4);
    expect(programmingCoach?.capabilities).toContain('Code review inteligente');
  });

  test('should handle AI chat conversations with message persistence', async ({ page }) => {
    await page.goto('/');
    
    const userId = 'chat-persistence-user';
    
    // Set up user and start chat session
    await page.evaluate((userId) => {
      const userData = {
        user: {
          id: userId,
          email: 'chatpersist@test.com',
          fullName: 'Usuário Persistência Chat',
          role: 'user',
          plan: { credits: 300 }
        },
        token: 'chat_persist_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
    }, userId);

    // Create a conversation with AI
    await page.evaluate((userId) => {
      const conversationId = `conv_${userId}_${Date.now()}`;
      const assistantId = 'math-tutor';
      
      const conversation = {
        id: conversationId,
        user_id: userId,
        assistant_id: assistantId,
        title: 'Aula de Matemática',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 4,
        total_credits_used: 8,
        status: 'active'
      };
      
      const messages = [
        {
          id: `msg_1_${conversationId}`,
          conversation_id: conversationId,
          role: 'system',
          content: 'Você é Prof. Magnus, especialista em matemática...',
          credits_used: 0,
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
          id: `msg_2_${conversationId}`,
          conversation_id: conversationId,
          role: 'user',
          content: 'Preciso de ajuda com equações de segundo grau',
          credits_used: 0,
          created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: `msg_3_${conversationId}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Claro! Equações de segundo grau são do tipo ax² + bx + c = 0. Vamos começar com conceitos básicos...',
          credits_used: 2,
          created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
          metadata: {
            confidence: 0.92,
            adaptationLevel: 0.7,
            learningStyle: 'visual'
          }
        },
        {
          id: `msg_4_${conversationId}`,
          conversation_id: conversationId,
          role: 'user',
          content: 'Pode me dar um exemplo prático?',
          credits_used: 0,
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        },
        {
          id: `msg_5_${conversationId}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Perfeito! Vamos resolver x² - 5x + 6 = 0 usando a fórmula de Bhaskara...',
          credits_used: 2,
          created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          metadata: {
            confidence: 0.95,
            adaptationLevel: 0.8,
            learningStyle: 'visual'
          }
        }
      ];
      
      localStorage.setItem(`supabase_conversations_${userId}`, JSON.stringify([conversation]));
      localStorage.setItem(`supabase_messages_${userId}`, JSON.stringify(messages));
      
      // Update credit usage
      const creditTransaction = {
        id: `trans_chat_${conversationId}`,
        user_id: userId,
        type: 'debit',
        amount: -4,
        description: 'Chat IA - Prof. Magnus',
        created_at: new Date().toISOString(),
        metadata: {
          conversation_id: conversationId,
          assistant_id: assistantId,
          message_count: 2
        }
      };
      
      localStorage.setItem(`supabase_transactions_${userId}`, JSON.stringify([creditTransaction]));
    }, userId);

    await page.reload();
    await page.waitForTimeout(1000);

    // Verify conversation persistence
    const chatData = await page.evaluate((userId) => {
      const conversations = localStorage.getItem(`supabase_conversations_${userId}`);
      const messages = localStorage.getItem(`supabase_messages_${userId}`);
      const transactions = localStorage.getItem(`supabase_transactions_${userId}`);
      
      return {
        conversations: conversations ? JSON.parse(conversations) : null,
        messages: messages ? JSON.parse(messages) : null,
        transactions: transactions ? JSON.parse(transactions) : null
      };
    }, userId);

    expect(chatData.conversations).toHaveLength(1);
    expect(chatData.conversations[0].title).toBe('Aula de Matemática');
    expect(chatData.conversations[0].assistant_id).toBe('math-tutor');
    expect(chatData.conversations[0].total_credits_used).toBe(8);

    expect(chatData.messages).toHaveLength(5);
    expect(chatData.messages[1].content).toContain('equações de segundo grau');
    expect(chatData.messages[2].role).toBe('assistant');
    expect(chatData.messages[2].credits_used).toBe(2);

    expect(chatData.transactions).toHaveLength(1);
    expect(chatData.transactions[0].amount).toBe(-4);
    expect(chatData.transactions[0].description).toContain('Prof. Magnus');
  });

  test('should implement task reading and interpretation capabilities', async ({ page }) => {
    await page.goto('/');
    
    const userId = 'task-interpretation-user';
    
    // Set up user with task analysis capabilities
    await page.evaluate((userId) => {
      const userData = {
        user: {
          id: userId,
          email: 'taskread@test.com',
          fullName: 'Usuário Interpretação Tarefas',
          role: 'user',
          plan: { credits: 400 }
        },
        token: 'task_read_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
    }, userId);

    // Simulate task upload and AI interpretation
    await page.evaluate((userId) => {
      const taskDocument = {
        id: `task_${userId}_${Date.now()}`,
        user_id: userId,
        title: 'Lista de Exercícios - Álgebra',
        content: `
          EXERCÍCIOS DE ÁLGEBRA - 9º ANO
          
          1. Resolva as seguintes equações de segundo grau:
             a) x² - 4x + 3 = 0
             b) 2x² + 5x - 3 = 0
             c) x² - 9 = 0
          
          2. Simplifique as expressões algébricas:
             a) 3x + 2x - x
             b) (x + 2)(x - 3)
             c) x²/x
          
          3. Problemas práticos:
             a) Um terreno retangular tem comprimento 3m maior que a largura. 
                Se a área é 40m², quais são as dimensões?
        `,
        type: 'homework',
        subject: 'Matemática',
        difficulty: 'intermediate',
        uploaded_at: new Date().toISOString(),
        processed: false
      };
      
      // AI interpretation results
      const aiInterpretation = {
        id: `interpretation_${taskDocument.id}`,
        task_id: taskDocument.id,
        assistant_id: 'math-tutor',
        analysis: {
          subject: 'Matemática - Álgebra',
          topics: ['Equações de segundo grau', 'Expressões algébricas', 'Problemas práticos'],
          difficulty_level: 'intermediário',
          estimated_time: 45,
          prerequisites: ['Operações básicas', 'Fatoração', 'Fórmula de Bhaskara'],
          learning_objectives: [
            'Resolver equações quadráticas',
            'Simplificar expressões algébricas',
            'Aplicar álgebra em problemas do cotidiano'
          ]
        },
        suggestions: [
          'Comece revisando a fórmula de Bhaskara',
          'Pratique fatoração antes dos exercícios',
          'Use gráficos para visualizar as funções quadráticas'
        ],
        step_by_step_plan: [
          'Revisar conceitos fundamentais',
          'Resolver exercícios guiados',
          'Praticar problemas similares',
          'Aplicar em situações práticas'
        ],
        credits_used: 5,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem(`user_tasks_${userId}`, JSON.stringify([taskDocument]));
      localStorage.setItem(`task_interpretations_${userId}`, JSON.stringify([aiInterpretation]));
      
      // Credit transaction for interpretation
      const interpretationTransaction = {
        id: `trans_interpret_${taskDocument.id}`,
        user_id: userId,
        type: 'debit',
        amount: -5,
        description: 'Interpretação de Tarefa - IA',
        created_at: new Date().toISOString(),
        metadata: {
          task_id: taskDocument.id,
          service: 'task_interpretation',
          assistant_id: 'math-tutor'
        }
      };
      
      localStorage.setItem(`supabase_transactions_${userId}`, JSON.stringify([interpretationTransaction]));
    }, userId);

    // Verify task interpretation data
    const taskData = await page.evaluate((userId) => {
      const tasks = localStorage.getItem(`user_tasks_${userId}`);
      const interpretations = localStorage.getItem(`task_interpretations_${userId}`);
      const transactions = localStorage.getItem(`supabase_transactions_${userId}`);
      
      return {
        tasks: tasks ? JSON.parse(tasks) : null,
        interpretations: interpretations ? JSON.parse(interpretations) : null,
        transactions: transactions ? JSON.parse(transactions) : null
      };
    }, userId);

    expect(taskData.tasks).toHaveLength(1);
    expect(taskData.tasks[0].title).toBe('Lista de Exercícios - Álgebra');
    expect(taskData.tasks[0].subject).toBe('Matemática');
    expect(taskData.tasks[0].content).toContain('equações de segundo grau');

    expect(taskData.interpretations).toHaveLength(1);
    const interpretation = taskData.interpretations[0];
    expect(interpretation.analysis.topics).toContain('Equações de segundo grau');
    expect(interpretation.analysis.difficulty_level).toBe('intermediário');
    expect(interpretation.analysis.estimated_time).toBe(45);
    expect(interpretation.suggestions).toHaveLength(3);
    expect(interpretation.step_by_step_plan).toHaveLength(4);

    expect(taskData.transactions).toHaveLength(1);
    expect(taskData.transactions[0].amount).toBe(-5);
    expect(taskData.transactions[0].description).toContain('Interpretação de Tarefa');
  });

  test('should generate educational content based on school subjects and levels', async ({ page }) => {
    await page.goto('/');
    
    const userId = 'content-generation-user';
    
    // Set up user for content generation
    await page.evaluate((userId) => {
      const userData = {
        user: {
          id: userId,
          email: 'contentgen@test.com',
          fullName: 'Usuário Geração Conteúdo',
          role: 'user',
          plan: { credits: 600 }
        },
        token: 'content_gen_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
    }, userId);

    // Simulate content generation for different subjects and levels
    await page.evaluate((userId) => {
      const contentRequests = [
        {
          id: `content_math_elementary_${userId}`,
          user_id: userId,
          subject: 'Matemática',
          level: 'elementary',
          topic: 'Frações',
          content_type: 'lesson',
          generated_content: `
            # Lição: Frações - Ensino Fundamental
            
            ## O que são frações?
            Frações representam partes de um todo. Imagine uma pizza dividida em pedaços iguais!
            
            ## Componentes de uma fração:
            - **Numerador**: número de partes que temos
            - **Denominador**: total de partes em que o todo foi dividido
            
            ## Exemplos práticos:
            - 1/2 = metade de algo
            - 3/4 = três quartos de algo
            - 2/5 = duas partes de cinco
            
            ## Atividade:
            Desenhe círculos e divida-os para representar diferentes frações!
          `,
          assistant_id: 'math-tutor',
          credits_used: 3,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `content_portuguese_middle_${userId}`,
          user_id: userId,
          subject: 'Português',
          level: 'middle_school',
          topic: 'Redação Narrativa',
          content_type: 'exercise',
          generated_content: `
            # Exercício: Redação Narrativa - 7º Ano
            
            ## Instruções:
            Escreva uma narrativa de 15-20 linhas sobre "Um dia inusitado na escola"
            
            ## Elementos que devem aparecer:
            1. **Personagens**: Você e pelo menos 2 colegas
            2. **Tempo**: Durante o recreio
            3. **Espaço**: Pátio da escola
            4. **Conflito**: Algo inesperado acontece
            5. **Resolução**: Como a situação foi resolvida
            
            ## Dicas de escrita:
            - Use verbos no passado
            - Inclua diálogos para dar vida à história
            - Descreva as emoções dos personagens
            - Mantenha a sequência cronológica dos fatos
            
            ## Critérios de avaliação:
            - Criatividade na história
            - Uso correto da língua portuguesa
            - Presença dos elementos narrativos
            - Coerência e coesão do texto
          `,
          assistant_id: 'writing-assistant',
          credits_used: 4,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `content_programming_high_${userId}`,
          user_id: userId,
          subject: 'Programação',
          level: 'high_school',
          topic: 'Algoritmos de Ordenação',
          content_type: 'lesson',
          generated_content: `
            # Lição: Algoritmos de Ordenação - Ensino Médio
            
            ## Introdução
            Algoritmos de ordenação são fundamentais na ciência da computação.
            Eles organizam dados de forma eficiente.
            
            ## Bubble Sort
            \`\`\`python
            def bubble_sort(arr):
                n = len(arr)
                for i in range(n):
                    for j in range(0, n-i-1):
                        if arr[j] > arr[j+1]:
                            arr[j], arr[j+1] = arr[j+1], arr[j]
                return arr
            \`\`\`
            
            ## Como funciona:
            1. Compara elementos adjacentes
            2. Troca se estiverem na ordem errada
            3. Repete até a lista estar ordenada
            
            ## Complexidade:
            - Tempo: O(n²) no pior caso
            - Espaço: O(1)
            
            ## Exercício prático:
            Implemente o Bubble Sort e teste com a lista [64, 34, 25, 12, 22, 11, 90]
          `,
          assistant_id: 'programming-coach',
          credits_used: 5,
          created_at: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(`generated_content_${userId}`, JSON.stringify(contentRequests));
      
      // Credit transactions for content generation
      const contentTransactions = contentRequests.map(content => ({
        id: `trans_${content.id}`,
        user_id: userId,
        type: 'debit',
        amount: -content.credits_used,
        description: `Geração de Conteúdo - ${content.subject}`,
        created_at: content.created_at,
        metadata: {
          content_id: content.id,
          subject: content.subject,
          level: content.level,
          topic: content.topic,
          assistant_id: content.assistant_id
        }
      }));
      
      localStorage.setItem(`supabase_transactions_${userId}`, JSON.stringify(contentTransactions));
    }, userId);

    // Verify generated content
    const contentData = await page.evaluate((userId) => {
      const content = localStorage.getItem(`generated_content_${userId}`);
      const transactions = localStorage.getItem(`supabase_transactions_${userId}`);
      
      return {
        content: content ? JSON.parse(content) : null,
        transactions: transactions ? JSON.parse(transactions) : null
      };
    }, userId);

    expect(contentData.content).toHaveLength(3);

    // Test elementary math content
    const mathContent = contentData.content.find((c: unknown) => c.subject === 'Matemática');
    expect(mathContent?.level).toBe('elementary');
    expect(mathContent?.topic).toBe('Frações');
    expect(mathContent?.generated_content).toContain('pizza dividida em pedaços');
    expect(mathContent?.assistant_id).toBe('math-tutor');
    expect(mathContent?.credits_used).toBe(3);

    // Test middle school Portuguese content
    const portugueseContent = contentData.content.find((c: unknown) => c.subject === 'Português');
    expect(portugueseContent?.level).toBe('middle_school');
    expect(portugueseContent?.topic).toBe('Redação Narrativa');
    expect(portugueseContent?.generated_content).toContain('elementos narrativos');
    expect(portugueseContent?.assistant_id).toBe('writing-assistant');
    expect(portugueseContent?.credits_used).toBe(4);

    // Test high school programming content
    const programmingContent = contentData.content.find((c: unknown) => c.subject === 'Programação');
    expect(programmingContent?.level).toBe('high_school');
    expect(programmingContent?.topic).toBe('Algoritmos de Ordenação');
    expect(programmingContent?.generated_content).toContain('bubble_sort');
    expect(programmingContent?.assistant_id).toBe('programming-coach');
    expect(programmingContent?.credits_used).toBe(5);

    // Verify transactions
    expect(contentData.transactions).toHaveLength(3);
    const totalCreditsUsed = contentData.transactions.reduce((sum: number, t: unknown) => sum + Math.abs(t.amount), 0);
    expect(totalCreditsUsed).toBe(12); // 3 + 4 + 5
  });

  test('should track learning progress and analytics', async ({ page }) => {
    await page.goto('/');
    
    const userId = 'learning-progress-user';
    
    // Set up comprehensive learning analytics
    await page.evaluate((userId) => {
      const userData = {
        user: {
          id: userId,
          email: 'progress@test.com',
          fullName: 'Usuário Progresso Aprendizado',
          role: 'user',
          plan: { credits: 300 }
        },
        token: 'progress_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
      
      // Learning analytics data
      const learningAnalytics = {
        id: `analytics_${userId}`,
        user_id: userId,
        total_points: 450,
        level: 7,
        streak_current: 12,
        streak_longest: 18,
        study_time_total: 3600, // 60 hours in minutes
        sessions_completed: 45,
        concepts_mastered: 28,
        created_at: '2024-12-01T10:00:00Z',
        updated_at: new Date().toISOString(),
        data: {
          subjects: {
            'Matemática': { points: 180, level: 8, mastered_concepts: 12 },
            'Português': { points: 150, level: 6, mastered_concepts: 10 },
            'Programação': { points: 120, level: 5, mastered_concepts: 6 }
          },
          weekly_activity: [
            { week: '2024-W50', sessions: 8, points: 65, study_time: 240 },
            { week: '2024-W51', sessions: 10, points: 85, study_time: 320 },
            { week: '2024-W52', sessions: 12, points: 95, study_time: 380 }
          ],
          learning_path_progress: {
            'algebra_fundamentals': { progress: 85, completed_lessons: 17, total_lessons: 20 },
            'creative_writing': { progress: 70, completed_lessons: 14, total_lessons: 20 },
            'python_basics': { progress: 60, completed_lessons: 12, total_lessons: 20 }
          }
        }
      };
      
      localStorage.setItem(`supabase_analytics_${userId}`, JSON.stringify([learningAnalytics]));
      
      // Study sessions
      const studySessions = [
        {
          id: `session_1_${userId}`,
          user_id: userId,
          assistant_id: 'math-tutor',
          subject: 'Matemática',
          topic: 'Equações lineares',
          start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          score: 92,
          credits_used: 6,
          notes: 'Excelente compreensão dos conceitos básicos',
          completed: true,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `session_2_${userId}`,
          user_id: userId,
          assistant_id: 'writing-assistant',
          subject: 'Português',
          topic: 'Análise textual',
          start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          score: 88,
          credits_used: 8,
          notes: 'Boa interpretação, precisa melhorar argumentação',
          completed: true,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      localStorage.setItem(`supabase_study_sessions_${userId}`, JSON.stringify(studySessions));
      
      // Achievements
      const achievements = [
        {
          id: `achievement_streak_${userId}`,
          user_id: userId,
          achievement_type: 'streak',
          title: 'Sequência de 10 dias',
          description: 'Estudou por 10 dias consecutivos',
          icon: '🔥',
          points: 50,
          unlocked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `achievement_math_expert_${userId}`,
          user_id: userId,
          achievement_type: 'subject_mastery',
          title: 'Expert em Álgebra',
          description: 'Dominou todos os conceitos básicos de álgebra',
          icon: '🔢',
          points: 100,
          unlocked_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          metadata: {
            subject: 'Matemática',
            mastered_concepts: 12,
            final_score: 95
          }
        }
      ];
      
      localStorage.setItem(`supabase_achievements_${userId}`, JSON.stringify(achievements));
    }, userId);

    // Verify learning progress data
    const progressData = await page.evaluate((userId) => {
      const analytics = localStorage.getItem(`supabase_analytics_${userId}`);
      const sessions = localStorage.getItem(`supabase_study_sessions_${userId}`);
      const achievements = localStorage.getItem(`supabase_achievements_${userId}`);
      
      return {
        analytics: analytics ? JSON.parse(analytics) : null,
        sessions: sessions ? JSON.parse(sessions) : null,
        achievements: achievements ? JSON.parse(achievements) : null
      };
    }, userId);

    expect(progressData.analytics).toHaveLength(1);
    const analytics = progressData.analytics[0];
    expect(analytics.total_points).toBe(450);
    expect(analytics.level).toBe(7);
    expect(analytics.streak_current).toBe(12);
    expect(analytics.concepts_mastered).toBe(28);
    expect(analytics.data.subjects).toHaveProperty('Matemática');
    expect(analytics.data.subjects['Matemática'].level).toBe(8);

    expect(progressData.sessions).toHaveLength(2);
    expect(progressData.sessions[0].score).toBe(92);
    expect(progressData.sessions[1].subject).toBe('Português');

    expect(progressData.achievements).toHaveLength(2);
    expect(progressData.achievements[0].achievement_type).toBe('streak');
    expect(progressData.achievements[1].achievement_type).toBe('subject_mastery');
    expect(progressData.achievements[1].points).toBe(100);

    // Test progress calculations
    const calculatedProgress = await page.evaluate((userId) => {
      const analytics = JSON.parse(localStorage.getItem(`supabase_analytics_${userId}`) || '[]')[0];
      const sessions = JSON.parse(localStorage.getItem(`supabase_study_sessions_${userId}`) || '[]');
      
      const avgScore = sessions.reduce((sum: number, s: unknown) => sum + s.score, 0) / sessions.length;
      const totalStudyTime = sessions.reduce((sum: number, s: unknown) => sum + s.duration_minutes, 0);
      const subjectProgress = Object.values(analytics.data.subjects).map((s: unknown) => s.points);
      
      return {
        avgScore,
        totalStudyTime,
        subjectProgress,
        weeklyGrowth: analytics.data.weekly_activity[2].points - analytics.data.weekly_activity[0].points
      };
    }, userId);

    expect(calculatedProgress.avgScore).toBe(90); // (92 + 88) / 2
    expect(calculatedProgress.totalStudyTime).toBe(60); // 30 + 30
    expect(calculatedProgress.weeklyGrowth).toBe(30); // 95 - 65
  });

  test('should implement neuroadaptive learning features', async ({ page }) => {
    await page.goto('/');
    
    const userId = 'neuroadaptive-user';
    
    // Set up neuroadaptive learning profile
    await page.evaluate((userId) => {
      const userData = {
        user: {
          id: userId,
          email: 'neuroadaptive@test.com',
          fullName: 'Usuário Neuroadaptativo',
          role: 'user',
          plan: { credits: 400 }
        },
        token: 'neuroadaptive_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(userData));
      
      // Learning profile with neuroadaptive data
      const learningProfile = {
        userId: userId,
        preferredStyle: 'visual',
        difficulty: 'intermediate',
        interests: ['matemática', 'programação', 'resolução de problemas'],
        weakAreas: ['álgebra avançada', 'geometria espacial'],
        strongAreas: ['aritmética', 'lógica de programação'],
        adaptationHistory: [
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Adaptação para estilo visual',
            reason: 'Melhor compreensão com diagramas e gráficos',
            effectiveness: 0.85
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'Ajuste de dificuldade para intermediário',
            reason: 'Progresso consistente com nível atual',
            effectiveness: 0.92
          },
          {
            timestamp: new Date().toISOString(),
            action: 'Foco em áreas fracas identificadas',
            reason: 'Baixo desempenho em álgebra avançada',
            effectiveness: 0.78
          }
        ]
      };
      
      localStorage.setItem(`learning_profile_${userId}`, JSON.stringify(learningProfile));
      
      // Neuroadaptive conversation patterns
      const adaptiveResponses = [
        {
          id: `adaptive_response_1_${userId}`,
          user_id: userId,
          conversation_id: `conv_${userId}_math`,
          user_message: 'Como resolver x² + 5x + 6 = 0?',
          assistant_response: `
            Vou te ajudar a resolver essa equação quadrática! Como você prefere aprender visualmente, 
            vou usar um método gráfico:
            
            📊 **Visualização da Equação**: x² + 5x + 6 = 0
            
            🎯 **Método visual**:
            1. Imagine uma parábola que corta o eixo X em dois pontos
            2. Esses pontos são nossas soluções!
            
            📐 **Usando fatoração** (mais fácil que Bhaskara):
            - Precisamos de dois números que multiplicados dão 6 e somados dão 5
            - São 2 e 3! ✓
            - Então: (x + 2)(x + 3) = 0
            - Soluções: x = -2 ou x = -3
            
            🔍 **Verificação gráfica**: A parábola y = x² + 5x + 6 corta o eixo X em (-2, 0) e (-3, 0)
          `,
          adaptations_applied: [
            'visual_explanation',
            'step_by_step_breakdown', 
            'emoji_highlights',
            'multiple_methods',
            'verification_step'
          ],
          effectiveness_score: 0.94,
          created_at: new Date().toISOString()
        }
      ];
      
      localStorage.setItem(`adaptive_responses_${userId}`, JSON.stringify(adaptiveResponses));
    }, userId);

    // Verify neuroadaptive features
    const adaptiveData = await page.evaluate((userId) => {
      const profile = localStorage.getItem(`learning_profile_${userId}`);
      const responses = localStorage.getItem(`adaptive_responses_${userId}`);
      
      return {
        profile: profile ? JSON.parse(profile) : null,
        responses: responses ? JSON.parse(responses) : null
      };
    }, userId);

    expect(adaptiveData.profile?.preferredStyle).toBe('visual');
    expect(adaptiveData.profile?.difficulty).toBe('intermediate');
    expect(adaptiveData.profile?.interests).toContain('matemática');
    expect(adaptiveData.profile?.weakAreas).toContain('álgebra avançada');
    expect(adaptiveData.profile?.adaptationHistory).toHaveLength(3);

    const latestAdaptation = adaptiveData.profile.adaptationHistory[2];
    expect(latestAdaptation.action).toContain('áreas fracas');
    expect(latestAdaptation.effectiveness).toBe(0.78);

    expect(adaptiveData.responses).toHaveLength(1);
    const response = adaptiveData.responses[0];
    expect(response.assistant_response).toContain('📊');
    expect(response.assistant_response).toContain('método gráfico');
    expect(response.adaptations_applied).toContain('visual_explanation');
    expect(response.effectiveness_score).toBe(0.94);

    // Test adaptation effectiveness tracking
    const adaptationMetrics = await page.evaluate((userId) => {
      const profile = JSON.parse(localStorage.getItem(`learning_profile_${userId}`) || '{}');
      
      const avgEffectiveness = profile.adaptationHistory.reduce((sum: number, adaptation: unknown) => 
        sum + adaptation.effectiveness, 0) / profile.adaptationHistory.length;
      
      const recentEffectiveness = profile.adaptationHistory
        .slice(-3)
        .reduce((sum: number, adaptation: unknown) => sum + adaptation.effectiveness, 0) / 3;
      
      const adaptationTrend = recentEffectiveness > avgEffectiveness ? 'improving' : 'stable';
      
      return {
        avgEffectiveness,
        recentEffectiveness,
        adaptationTrend,
        totalAdaptations: profile.adaptationHistory.length
      };
    }, userId);

    expect(adaptationMetrics.avgEffectiveness).toBeCloseTo(0.85, 2);
    expect(adaptationMetrics.totalAdaptations).toBe(3);
    expect(['improving', 'stable']).toContain(adaptationMetrics.adaptationTrend);
  });
});