
import { Language } from '../types';

type Prompts = {
    generateClassroom: string;
    analyzeSubmissions: string;
    generateTrainerLesson: string;
    analyzeClassroomChat: string;
    generateAdaptivePathways: string;
    analyzeGradebook: string;
    onDemandAssignmentHelper: string;
    generateProjectIdeas: string;
}

const prompts: Record<Language, Prompts> = {
    en: {
        generateClassroom: `Generate a set of assignments for a high school {subject} class focusing on the topic: "{topic}". The assignments should be engaging, test understanding, and be in English.`,
        analyzeSubmissions: `As an expert teaching assistant, analyze the following student submissions for the assignment titled "{assignmentTitle}".

Assignment Questions for context:
{questions}

Student Submissions (in JSON format):
{submissions}

Based on this data, provide a concise analysis in English covering these points:
1.  **Overall Performance Summary:** A brief overview of how the class performed.
2.  **Common Misconceptions:** Identify specific questions or topics where multiple students struggled and explain the likely misunderstanding.
3.  **Key Insights:** What are the main takeaways for the teacher? What concepts need reinforcement?
4.  **Actionable Recommendations:** Suggest 2-3 specific actions the teacher can take (e.g., "Review concept X," "Offer a small group session for students who missed Q2").

Format your response clearly with markdown headings.`,
        generateTrainerLesson: `Create a short, personal training session in English for a student on the topic: "{topic}". Include a title, a concise one-paragraph summary of the topic, and 3-5 questions to test their knowledge, each with a clear answer.`,
        analyzeClassroomChat: `
You are an expert AI teaching assistant co-pilot. Your purpose is to privately help a teacher manage their live online class by analyzing the student chat log in real-time. The teacher's language is English.
The topic of this class is: "{classroomTopic}".
The full student roster is: {studentRoster}.

Here is the recent chat history:
---
{chatHistory}
---

Based on the roster and the chat history, provide a concise, private briefing for the teacher in English with the following sections. Use markdown for formatting.

### 🗣️ Points of Confusion
Identify specific questions, keywords, or sentiments from students that suggest misunderstanding or confusion about "{classroomTopic}". If multiple students mention the same thing, highlight it. If nothing is confusing, state that comprehension seems good.

###  Engagement Watch
Compare the list of students who have participated in the chat ({participatingStudents}) with the full roster. List any students who have not sent any messages.

### ✨ Actionable Suggestions
Based on your analysis, suggest 1-2 immediate, actionable things the teacher could do. For example:
- "Ask a quick poll: 'On a scale of 1-5, how well do you understand concept X?'"
- "Directly ask one of the quiet students, like [Student's Name], for their opinion on the topic."
- "Re-explain the difference between concept A and concept B."`,
        generateAdaptivePathways: `
You are an expert instructional designer. Your task is to create a differentiated, adaptive learning plan in English for a class based on their past performance.
The learning objective for this week is: "{topic}".

Here is the student performance data:
{studentData}

Analyze this data and perform the following actions:
1.  Group all students into three distinct categories: 'Accelerated' (for high-performers who need a challenge), 'Proficient' (for students who are on track), and 'Needs Reinforcement' (for students who are struggling).
2.  For each group, create one unique, tailored assignment that is appropriate for their level and addresses the learning objective ("{topic}").
    - The 'Accelerated' assignment should be a project-based or a deeper-thinking task.
    - The 'Proficient' assignment should be a standard homework task to solidify understanding.
    - The 'Needs Reinforcement' assignment should be foundational, perhaps with more direct questions or a guided structure.
3.  Each assignment must have a title, a brief description, and 3-5 questions.

Return your entire plan as a single JSON object.`,
        analyzeGradebook: `
You are an expert data analyst for an education platform. Your task is to analyze a classroom's gradebook and provide a detailed performance report for the teacher. The teacher's language is English.

Classroom: {classroomName}
Here is the full gradebook data. Each student has a list of their grades for various assignments. A grade of -1 indicates no submission.
{gradebookData}

Analyze this data and return a single JSON object with a detailed report.`,
        onDemandAssignmentHelper: `You are an AI study buddy. You are helping a student with a specific question from their homework. The student's question is: '{questionText}'. Your goal is to guide the student to the answer, not give it to them. Do NOT provide the direct answer. Ask leading questions, explain related concepts, or offer hints to help them solve it themselves. Respond in the user's language.`,
        generateProjectIdeas: `You are an expert curriculum designer. Your task is to generate 3-5 innovative group project ideas in English for a class on {subject}, specifically focusing on the topic of "{topic}". Each project idea should be suitable for high school students. For each idea, provide a catchy title, a one-paragraph description aimed at students, and 2-3 key guiding questions that the project should answer. Return the result as a single JSON object.`
    },
    pt: {
        generateClassroom: `Gere um conjunto de tarefas para uma turma de {subject} do ensino médio com foco no tópico: "{topic}". As tarefas devem ser envolventes, testar a compreensão e estar em Português do Brasil.`,
        analyzeSubmissions: `Como um assistente de ensino especialista, analise os seguintes envios de alunos para a tarefa intitulada "{assignmentTitle}".

Questões da Tarefa para contexto:
{questions}

Envios dos Alunos (em formato JSON):
{submissions}

Com base nesses dados, forneça uma análise concisa em Português do Brasil cobrindo estes pontos:
1.  **Resumo do Desempenho Geral:** Uma breve visão geral de como a turma se saiu.
2.  **Equívocos Comuns:** Identifique questões ou tópicos específicos onde vários alunos tiveram dificuldade e explique o provável mal-entendido.
3.  **Principais Insights:** Quais são as principales conclusões para o professor? Quais conceitos precisam de reforço?
4.  **Recomendações Práticas:** Sugira 2-3 ações específicas que o professor pode tomar (por exemplo, "Revisar o conceito X," "Oferecer uma sessão em grupo para os alunos que erraram a Q2").

Formate sua resposta claramente com títulos em markdown.`,
        generateTrainerLesson: `Crie uma sessão de treinamento pessoal curta em Português do Brasil para um aluno sobre o tópico: "{topic}". Inclua um título, um resumo conciso de um parágrafo sobre o tópico e 3-5 perguntas para testar seus conocimientos, cada uma com uma resposta clara.`,
        analyzeClassroomChat: `
Você é um copiloto assistente de ensino de IA especialista. Seu propósito é ajudar privadamente um professor a gerenciar sua aula online ao vivo, analisando o registro de chat dos alunos em tempo real. O idioma do professor é Português do Brasil.
O tópico desta aula é: "{classroomTopic}".
A lista completa de alunos é: {studentRoster}.

Aqui está o histórico de chat recente:
---
{chatHistory}
---

Com base na lista e no histórico do chat, forneça um briefing conciso e privado para o professor em Português do Brasil com as seguintes seções. Use markdown para formatação.

### 🗣️ Pontos de Confusão
Identifique perguntas, palavras-chave ou sentimentos específicos dos alunos que sugerem mal-entendido ou confusão sobre "{classroomTopic}". Se vários alunos mencionarem a mesma coisa, destaque-a. Se nada for confuso, afirme que a compreensão parece boa.

###  Monitoramento do Engajamento
Compare a lista de alunos que participaram do chat ({participatingStudents}) com a lista completa. Liste os alunos que não enviaram nenhuma mensagem.

### ✨ Sugestões Práticas
Com base em sua análise, sugira 1-2 coisas imediatas e práticas que o professor poderia fazer. Por exemplo:
- "Faça uma enquete rápida: 'Numa escala de 1 a 5, quão bem você entende o conceito X?'"
- "Pergunte diretamente a um dos alunos quietos, como [Nome do Aluno], sua opinião sobre o tópico."
- "Reexplique a diferença entre o conceito A и o conceito B."`,
        generateAdaptivePathways: `
Você é um designer instrucional especialista. Sua tarefa é criar um plano de aprendizado diferenciado e adaptativo em Português do Brasil para uma turma com base no desempenho anterior.
O objetivo de aprendizagem para esta semana é: "{topic}".

Aqui estão os dados de desempenho dos alunos:
{studentData}

Analise esses dados e execute as seguintes ações:
1.  Agrupe todos os alunos em três categorias distintas: 'Acelerado' (para alunos de alto desempenho que precisam de um desafio), 'Proficiente' (para alunos que estão no caminho certo) e 'Precisa de Reforço' (para alunos com dificuldades).
2.  Para cada grupo, crie uma tarefa única e personalizada que seja apropriada para o nível deles e aborde o objetivo de aprendizagem ("{topic}").
    - A tarefa 'Acelerado' deve ser um projeto ou uma tarefa de pensamento mais profundo.
    - A tarefa 'Proficiente' deve ser uma tarefa de casa padrão para solidificar a compreensão.
    - A tarefa 'Precisa de Reforço' deve ser fundamental, talvez com perguntas mais diretas ou uma estrutura guiada.
3.  Cada tarefa deve ter um título, uma breve descrição e 3-5 perguntas.

Retorne seu plano inteiro como um único objeto JSON.`,
        analyzeGradebook: `
Você é um analista de dados especialista para uma plataforma de educação. Sua tarefa é analisar o diário de classe de uma turma e fornecer um relatório de desempenho detalhado para o professor. O idioma do professor é Português do Brasil.

Turma: {classroomName}
Aqui estão os dados completos do diário de classe. Cada aluno tem uma lista de suas notas para várias tarefas. Uma nota de -1 indica que não houve envio.
{gradebookData}

Analise estes dados e retorne um único objeto JSON com um relatório detalhado.`,
        onDemandAssignmentHelper: `Você é um amigo de estudos de IA. Você está ajudando um aluno com uma pergunta específica do dever de casa. A pergunta do aluno é: '{questionText}'. Seu objetivo é guiar o aluno até a resposta, não dá-la de presente. NÃO forneça a resposta direta. Faça perguntas orientadoras, explique conceitos relacionados ou ofereça dicas para ajudá-los a resolver por conta própria. Responda no idioma do usuário.`,
        generateProjectIdeas: `Você é um designer de currículo especialista. Sua tarefa é gerar de 3 a 5 ideias inovadoras de projetos em grupo em português para uma aula sobre {subject}, focando especificamente no tópico de "{topic}". Cada ideia de projeto deve ser adequada para alunos do ensino médio. Para cada ideia, forneça um título atraente, uma descrição de um parágrafo destinada aos alunos e 2-3 perguntas-chave orientadoras que o projeto deve responder. Retorne o resultado como um único objeto JSON.`
    },
    ja: {
        generateClassroom: `高校の{subject}のクラス向けに、トピック「{topic}」に焦点を当てた課題セットを生成してください。課題は魅力的で、理解度を試すものであり、日本語である必要があります。`,
        analyzeSubmissions: `専門の教育アシスタントとして、課題名「{assignmentTitle}」に対する以下の生徒の提出物を分析してください。

文脈のための課題の質問：
{questions}

生徒の提出物（JSON形式）：
{submissions}

このデータに基づき、以下の点について日本語で簡潔な分析を提供してください：
1.  **全体的なパフォーマンス概要：** クラス全体の成績の簡単な概要。
2.  **よくある誤解：** 複数の生徒が苦労した特定の質問やトピックを特定し、考えられる誤解を説明します。
3.  **主要な洞察：** 教師にとっての主な収穫は何ですか？どの概念を補強する必要がありますか？
4.  **実行可能な推奨事項：** 教師が取ることができる2～3の具体的な行動を提案します（例：「概念Xを復習する」、「Q2を間違えた生徒向けに小グループセッションを提供する」）。

応答はマークダウンの見出しで明確にフォーマットしてください。`,
        generateTrainerLesson: `トピック「{topic}」について、学生向けの短いパーソナルトレーニングセッションを日本語で作成してください。タイトル、トピックの簡潔な1段落の要約、そして知識をテストするための3～5つの質問（それぞれに明確な答え付き）を含めてください。`,
        analyzeClassroomChat: `
あなたは専門のAI教育アシスタントコパイロットです。あなたの目的は、リアルタイムで生徒のチャットログを分析することにより、教師がライブオンラインクラスを個人的に管理するのを助けることです。教師の言語は日本語です。
このクラスのトピックは：「{classroomTopic}」。
全生徒名簿は：{studentRoster}。

最近のチャット履歴はこちらです：
---
{chatHistory}
---

名簿とチャット履歴に基づき、教師向けに以下のセクションを含む簡潔なプライベートブリーフィングを日本語で提供してください。書式設定にはマークダウンを使用してください。

### 🗣️ 混乱のポイント
「{classroomTopic}」についての誤解や混乱を示唆する生徒からの特定の質問、キーワード、または感情を特定してください。複数の生徒が同じことを言及している場合は、それを強調してください。何も混乱がない場合は、理解が良いと述べてください。

###  エンゲージメントウォッチ
チャットに参加した生徒のリスト（{participatingStudents}）と全名簿を比較してください。メッセージを送信していない生徒をリストアップしてください。

### ✨ 実行可能な提案
あなたの分析に基づき、教師がすぐに行える1～2の実行可能なことを提案してください。例えば：
- 「簡単な投票をしてください：『概念Xを1～5のスケールでどれくらい理解していますか？』」
- 「静かな生徒の一人、例えば[生徒の名前]に、トピックについての意見を直接尋ねてください。」
- 「概念Aと概念Bの違いを再説明してください。」`,
        generateAdaptivePathways: `
あなたは専門のインストラクショナルデザイナーです。あなたの仕事は、過去の成績に基づいて、クラス向けの差別化された適応学習計画を日本語で作成することがあなたの仕事です。
今週の学習目標は：「{topic}」。

生徒の成績データはこちらです：
{studentData}

このデータを分析し、以下の操作を実行してください：
1.  全生徒を「加速」（挑戦が必要な高成績者向け）、「習熟」（順調な生徒向け）、「補強が必要」（苦労している生徒向け）の3つの異なるカテゴリにグループ分けします。
2.  各グループに対して、彼らのレベルに適し、学習目標（「{topic}」）に対応するユニークでカスタマイズされた課題を1つ作成します。
    - 「加速」の課題は、プロジェクトベースまたはより深い思考を要するタスクであるべきです。
    - 「習熟」の課題は、理解を固めるための標準的な宿題タスクであるべきです。
    - 「補強が必要」の課題は、より直接的な質問やガイド付きの構造を持つ基礎的なものであるべきです。
3.  各課題には、タイトル、簡単な説明、および3～5つの質問が必要です。

計画全体を単一のJSONオブジェクトとして返してください。`,
        analyzeGradebook: `
あなたは教育プラットフォームの専門データアナリストです。あなたの仕事は、教室の成績表を分析し、教師向けに詳細な成績レポートを提供することです。教師の言語は日本語です。

教室：{classroomName}
これが完全な成績表データです。各生徒には、さまざまな課題に対する成績のリストがあります。成績が-1の場合は未提出を示します。
{gradebookData}

このデータを分析し、詳細なレポートを含む単一のJSONオブジェクトを返してください。`,
        onDemandAssignmentHelper: `あなたはAI学習バディです。宿題の特定の問題について生徒を手伝っています。生徒の質問は「{questionText}」です。あなたの目標は、生徒が自分で答えを見つけられるように導くことであり、答えを教えることではありません。直接的な答えは絶対に提供しないでください。代わりに、誘導的な質問をしたり、関連する概念を説明したり、ヒントを提供したりして、彼らが自力で解決できるよう手助けしてください。ユーザーの言語で応答してください。`,
        generateProjectIdeas: `あなたは専門のカリキュラムデザイナーです。あなたの仕事は、{subject}のクラス向けに、特に「{topic}」というトピックに焦点を当てた、革新的なグループプロジェクトのアイデアを日本語で3～5個生成することです。各プロジェクトのアイデアは高校生に適している必要があります。各アイデアについて、キャッチーなタイトル、生徒向けの1段落の説明、そしてプロジェクトが答えるべき2～3個の主要な指針となる質問を提供してください。結果は単一のJSONオブジェクトとして返してください。`
    },
    es: {
        generateClassroom: `Genera un conjunto de tareas para una clase de {subject} de secundaria centrada en el tema: "{topic}". Las tareas deben ser atractivas, evaluar la comprensión y estar en español.`,
        analyzeSubmissions: `Como un asistente de enseñanza experto, analiza las siguientes entregas de estudiantes para la tarea titulada "{assignmentTitle}".

Preguntas de la Tarea para contexto:
{questions}

Entregas de los Estudiantes (en formato JSON):
{submissions}

Basado en estos datos, proporciona un análisis conciso en español que cubra estos puntos:
1.  **Resumen del Rendimiento General:** Una breve descripción de cómo le fue a la clase.
2.  **Conceptos Erróneos Comunes:** Identifica preguntas o temas específicos en los que varios estudiantes tuvieron dificultades y explica el malentendido probable.
3.  **Perspectivas Clave:** ¿Cuáles son las principales conclusiones para el profesor? ¿Qué conceptos necesitan ser reforzados?
4.  **Recomendaciones Accionables:** Sugiere 2-3 acciones específicas que el profesor puede tomar (por ejemplo, "Revisar el concepto X", "Ofrecer una sesión en grupo para los estudiantes que fallaron la P2").

Formatea tu respuesta claramente con encabezados de markdown.`,
        generateTrainerLesson: `Crea una breve sesión de entrenamiento personal en español para un estudiante sobre el tema: "{topic}". Incluye un título, un resumen conciso de un párrafo sobre el tema y de 3 a 5 preguntas para evaluar su conocimiento, cada una con una respuesta clara.`,
        analyzeClassroomChat: `
Eres un copiloto experto de IA para asistencia docente. Tu propósito es ayudar de forma privada a un profesor a gestionar su clase en línea en vivo analizando el registro de chat de los estudiantes en tiempo real. El idioma del profesor es el español.
El tema de esta clase es: "{classroomTopic}".
La lista completa de estudiantes es: {studentRoster}.

Aquí está el historial de chat reciente:
---
{chatHistory}
---

Basado en la lista de estudiantes y el historial del chat, proporciona un informe conciso y privado para el profesor en español con las siguientes secciones. Usa markdown para el formato.

### 🗣️ Puntos de Confusión
Identifica preguntas, palabras clave o sentimientos específicos de los estudiantes que sugieran malentendidos o confusión sobre "{classroomTopic}". Si varios estudiantes mencionan lo mismo, destácalo. Si nada es confuso, indica que la comprensión parece ser buena.

###  Vigilancia de la Participación
Compara la lista de estudiantes que han participado en el chat ({participatingStudents}) con la lista completa. Enumera a los estudiantes que no han enviado ningún mensaje.

### ✨ Sugerencias Accionables
Basado en tu análisis, sugiere 1-2 acciones inmediatas y prácticas que el profesor podría tomar. Por ejemplo:
- "Haz una encuesta rápida: 'En una escala del 1 al 5, ¿qué tan bien entiendes el concepto X?'"
- "Pregúntale directamente a uno de los estudiantes callados, como [Nombre del Estudiante], su opinión sobre el tema."
- "Vuelve a explicar la diferencia entre el concepto A y el concepto B."`,
        generateAdaptivePathways: `
Eres un diseñador instruccional experto. Tu tarea es crear un plan de aprendizaje diferenciado y adaptativo en español para una clase basado en su rendimiento pasado.
El objetivo de aprendizaje para esta semana es: "{topic}".

Aquí están los datos de rendimiento de los estudiantes:
{studentData}

Analiza estos datos y realiza las siguientes acciones:
1.  Agrupa a todos los estudiantes en tres categorías distintas: 'Acelerado' (para estudiantes de alto rendimiento que necesitan un desafío), 'Competente' (para estudiantes que van por buen camino) y 'Necesita Refuerzo' (para estudiantes que tienen dificultades).
2.  Para cada grupo, crea una tarea única y adaptada que sea apropiada para su nivel y que aborde el objetivo de aprendizaje ("{topic}").
    - La tarea 'Acelerado' debe ser un proyecto o una tarea de pensamiento más profundo.
    - La tarea 'Competente' debe ser una tarea estándar para consolidar la comprensión.
    - La tarea 'Necesita Refuerzo' debe ser fundamental, quizás con preguntas más directas o una estructura guiada.
3.  Cada tarea debe tener un título, una breve descripción y de 3 a 5 preguntas.

Devuelve tu plan completo como un único objeto JSON.`,
        analyzeGradebook: `
Eres un analista de datos experto para una plataforma educativa. Tu tarea es analizar el libro de calificaciones de un aula y proporcionar un informe de rendimiento detallado para el profesor. El idioma del profesor es el español.

Aula: {classroomName}
Aquí están los datos completos del libro de calificaciones. Cada estudiante tiene una lista de sus calificaciones para varias tareas. Una calificación de -1 indica que no se entregó.
{gradebookData}

Analiza estos datos y devuelve un único objeto JSON con un informe detallado.`,
        onDemandAssignmentHelper: `Eres un compañero de estudio de IA. Estás ayudando a un estudiante con una pregunta específica de su tarea. La pregunta del estudiante es: '{questionText}'. Tu objetivo es guiar al estudiante hacia la respuesta, no dársela. NO proporciones la respuesta directa. Haz preguntas orientadoras, explica conceptos relacionados u ofrece pistas para ayudarles a resolverlo por sí mismos. Responde en el idioma del usuario.`,
        generateProjectIdeas: `Eres un diseñador de currículo experto. Tu tarea es generar de 3 a 5 ideas innovadoras de proyectos en grupo en español para una clase de {subject}, centrándose específicamente en el tema de "{topic}". Cada idea de proyecto debe ser adecuada para estudiantes de secundaria. Para cada idea, proporciona un título atractivo, una descripción de un párrafo dirigida a los estudiantes y de 2 a 3 preguntas guía clave que el proyecto debe responder. Devuelve el resultado como un único objeto JSON.`
    }
};

export const getPrompts = (lang: Language): Prompts => {
    return prompts[lang] || prompts.en;
};