











import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { ChatMessage, Question, AIProvider, LiveChatMessage, User, Submission, KnowledgeNode, AdaptivePathwayPlan, Language } from "../types";
import { getPrompts } from '../locales/prompts';

// --- Configuration ---
const GEMINI_API_KEY = process.env.API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OLLAMA_SERVER_URL = process.env.OLLAMA_SERVER_URL;

const geminiAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// --- Helper Functions ---
const getErrorMessage = (provider: AIProvider, lang: Language) => {
    const messages = {
        en: `Failed to get a response from ${provider}. Please check API key and network connection. The API key must be configured in the hosting environment variables. For Ollama, ensure the server is running and the URL is correct.`,
        pt: `Falha ao obter uma resposta do ${provider}. Verifique a chave de API e a conexão de rede. A chave de API deve ser configurada nas variáveis de ambiente da hospedagem. Para o Ollama, certifique-se de que o servidor está em execução e a URL está correta.`,
        ja: `${provider}からの応答の取得に失敗しました。APIキーとネットワーク接続を確認してください。APIキーはホスティング環境の環境変数で設定する必要があります。Ollamaの場合、サーバーが実行中でURLが正しいことを確認してください。`
    };
    return messages[lang] || messages.en;
}


export const isProviderConfigured = (provider: AIProvider): boolean => {
    if (provider === AIProvider.GEMINI) {
        return !!GEMINI_API_KEY;
    }
    if (provider === AIProvider.OPENROUTER) {
        return !!OPENROUTER_API_KEY;
    }
    if (provider === AIProvider.OLLAMA) {
        return !!OLLAMA_SERVER_URL;
    }
    return false;
};

interface AIOptions {
    ollamaModel?: string;
}

// --- NEW: Image Generator ---
export const generateImage = async (prompt: string, language: Language): Promise<string> => {
    try {
        if (!geminiAI) throw new Error("Gemini AI client not initialized for image generation.");
        const response = await geminiAI.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error(`Error generating image with Imagen:`, error);
        throw new Error(getErrorMessage(AIProvider.GEMINI, language));
    }
};

// --- NEW: Project Idea Generator ---
const projectIdeasSchema = {
    type: Type.OBJECT,
    properties: {
        ideas: {
            type: Type.ARRAY,
            description: "A list of 3-5 project ideas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy and descriptive title for the project." },
                    description: { type: Type.STRING, description: "A short, one-paragraph description of the project aimed at students." },
                    questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key questions students should aim to answer in the project." }
                },
                required: ['title', 'description', 'questions']
            }
        }
    },
    required: ['ideas']
};

export const generateProjectIdeas = async (provider: AIProvider, subject: string, topic: string, language: Language, options?: AIOptions) => {
    const prompts = getPrompts(language);
    const prompt = prompts.generateProjectIdeas.replace('{subject}', subject).replace('{topic}', topic);

    try {
        if (provider === AIProvider.GEMINI) {
            if (!geminiAI) throw new Error("Gemini AI client not initialized.");
            const response = await geminiAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: projectIdeasSchema }
            });
            return JSON.parse(response.text.trim());
        } else { // OpenRouter or Ollama (simplified fallback)
             const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "google/gemini-pro",
                    response_format: { type: "json_object" },
                    messages: [{ role: "user", content: `${prompt}. Respond in JSON matching this schema: ${JSON.stringify(projectIdeasSchema)}` }]
                })
            });
            if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        }
    } catch (error) {
        console.error(`Error generating project ideas with ${provider}:`, error);
        throw new Error(getErrorMessage(provider, language));
    }
};


// --- Classroom Generator ---
const classroomContentSchema = {
  type: Type.OBJECT,
  properties: {
    assignments: {
      type: Type.ARRAY,
      description: "A list of 1 to 3 assignments for the class.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the assignment." },
          description: { type: Type.STRING, description: "A brief description of the assignment." },
          questions: {
            type: Type.ARRAY,
            description: "A list of 3-5 questions.",
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['multiple-choice', 'open-ended'] },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options for multiple-choice questions. Can be empty for open-ended." },
                answer: { type: Type.STRING, description: "The correct answer to the question." }
              },
              required: ['questionText', 'type', 'answer']
            }
          }
        },
        required: ['title', 'description', 'questions']
      }
    }
  },
  required: ['assignments']
};

export const generateClassroomContent = async (provider: AIProvider, subject: string, topic: string, language: Language, options?: AIOptions) => {
  const prompts = getPrompts(language);
  const prompt = prompts.generateClassroom.replace('{subject}', subject).replace('{topic}', topic);
  
  try {
    if (provider === AIProvider.GEMINI) {
      if (!geminiAI) throw new Error("Gemini AI client not initialized. Ensure the API_KEY environment variable is set.");
      const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: classroomContentSchema }
      });
      return JSON.parse(response.text.trim());
    } else if (provider === AIProvider.OLLAMA) {
        if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured in OLLAMA_SERVER_URL environment variable.");
        if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
        const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: options.ollamaModel,
                prompt: `${prompt}. Respond ONLY with the raw JSON object, without any surrounding text or markdown. The JSON should conform to this schema: ${JSON.stringify(classroomContentSchema)}`,
                format: "json",
                stream: false
            })
        });
        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.response);
    } else { // OpenRouter
      if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured in the OPENROUTER_API_KEY environment variable.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-pro",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: `${prompt}. Respond in JSON matching this schema: ${JSON.stringify(classroomContentSchema)}` }]
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (error) {
    console.error(`Error generating classroom content with ${provider}:`, error);
    throw new Error(getErrorMessage(provider, language));
  }
};


// --- Gradebook Analyzer ---
const analyzeGradebookSchema = {
    type: Type.OBJECT,
    properties: {
        classAnalysis: {
            type: Type.STRING,
            description: "A detailed, multi-paragraph analysis of the class's overall performance, including trends, strengths, weaknesses, and specific recommendations for the teacher. Use markdown for formatting."
        },
        assignmentTopics: {
            type: Type.ARRAY,
            description: "An array categorizing each assignment into a single, concise knowledge area.",
            items: {
                type: Type.OBJECT,
                properties: {
                    assignmentId: { type: Type.STRING },
                    topic: { type: Type.STRING }
                },
                required: ['assignmentId', 'topic']
            }
        },
        gradeDistribution: {
            type: Type.OBJECT,
            description: "An object counting how many students fall into each grade bracket based on their overall average. Brackets are 'A' (90-100), 'B' (80-89), 'C' (70-79), 'D' (60-69), 'F' (0-59).",
            properties: {
                A: { type: Type.INTEGER },
                B: { type: Type.INTEGER },
                C: { type: Type.INTEGER },
                D: { type: Type.INTEGER },
                F: { type: Type.INTEGER },
            },
            required: ['A', 'B', 'C', 'D', 'F']
        }
    },
    required: ['classAnalysis', 'assignmentTopics', 'gradeDistribution']
};

export const analyzeGradebook = async (provider: AIProvider, classroomName: string, gradebookData: any, language: Language, options?: AIOptions) => {
    const prompts = getPrompts(language);
    const prompt = prompts.analyzeGradebook
        .replace('{classroomName}', classroomName)
        .replace('{gradebookData}', JSON.stringify(gradebookData, null, 2));

  try {
    if (provider === AIProvider.GEMINI) {
      if (!geminiAI) throw new Error("Gemini AI client not initialized. Ensure the API_KEY environment variable is set.");
      const response = await geminiAI.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: analyzeGradebookSchema }
      });
      return JSON.parse(response.text.trim());
    } else if (provider === AIProvider.OLLAMA) {
        if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured.");
        if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
        const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: options.ollamaModel,
                prompt: `${prompt}. Respond ONLY with the raw JSON object, without any surrounding text or markdown. The JSON should conform to this schema: ${JSON.stringify(analyzeGradebookSchema)}`,
                format: "json",
                stream: false
            })
        });
        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.response);
    } else { // OpenRouter
      if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured in the OPENROUTER_API_KEY environment variable.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ 
            model: "google/gemini-pro", 
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: `${prompt}. Respond ONLY with a valid JSON object matching this schema: ${JSON.stringify(analyzeGradebookSchema)}` }] 
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (error) {
    console.error(`Error analyzing gradebook with ${provider}:`, error);
    throw new Error(getErrorMessage(provider, language));
  }
};


// --- Personal Trainer Lesson Generator ---
const trainerLessonSchema = {
    type: Type.OBJECT,
    properties: {
        lessonTitle: { type: Type.STRING },
        lessonContent: { type: Type.STRING, description: "A brief, one-paragraph explanation of the topic for a high school student." },
        questions: {
            type: Type.ARRAY,
            description: "A list of 3-5 questions to test understanding.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: { type: Type.STRING },
                    answer: { type: Type.STRING, description: "The correct answer." }
                },
                required: ['questionText', 'answer']
            }
        }
    },
    required: ['lessonTitle', 'lessonContent', 'questions']
};

export const generateTrainerLesson = async (provider: AIProvider, topic: string, language: Language, options?: AIOptions) => {
  const prompts = getPrompts(language);
  const prompt = prompts.generateTrainerLesson.replace('{topic}', topic);

  try {
    if (provider === AIProvider.GEMINI) {
      if (!geminiAI) throw new Error("Gemini AI client not initialized.");
      const response = await geminiAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: trainerLessonSchema }
      });
      return JSON.parse(response.text.trim());
    } else if (provider === AIProvider.OLLAMA) {
        if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured.");
        if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
        const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: options.ollamaModel,
                prompt: `${prompt}. Respond ONLY with the raw JSON object, without any surrounding text or markdown. The JSON should conform to this schema: ${JSON.stringify(trainerLessonSchema)}`,
                format: "json",
                stream: false
            })
        });
        if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.response);
    } else { // OpenRouter
      if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured.");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-pro",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: `${prompt}. Respond in JSON matching this schema: ${JSON.stringify(trainerLessonSchema)}` }]
        })
      });
      if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    }
  } catch (error) {
    console.error(`Error generating trainer lesson with ${provider}:`, error);
    throw new Error(getErrorMessage(provider, language));
  }
};

// --- AI Student Helper ---
export const getAIHelperChat = (provider: AIProvider, systemInstruction: string, options?: AIOptions): Chat | any => {
    if (provider === AIProvider.GEMINI) {
        if (!geminiAI) throw new Error("Gemini AI client not initialized. Ensure the API_KEY environment variable is set.");
        return geminiAI.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: systemInstruction },
        });
    } else if (provider === AIProvider.OLLAMA) {
        if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured.");
        if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
        return {
            provider: 'ollama',
            model: options.ollamaModel,
            history: [{ role: 'system', content: systemInstruction }],
            async sendMessageStream({ message }: { message: string }) {
                this.history.push({ role: 'user', content: message });
                const response = await fetch(`${OLLAMA_SERVER_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.model,
                        messages: this.history,
                        stream: false // a full implementation would handle streaming chunks
                    })
                });
                if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
                const data = await response.json();
                const text = data.message.content;
                this.history.push({ role: 'assistant', content: text });

                // Simulate Gemini's stream response
                return (async function*() {
                    yield { text };
                })();
            }
        };
    } else { // OpenRouter
        if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured in the OPENROUTER_API_KEY environment variable.");
        // We will simulate a "chat" object for OpenRouter for compatibility
        return {
            provider: 'openrouter',
            history: [{ role: 'system', content: systemInstruction }],
            async sendMessageStream({ message }: { message: string }) {
                this.history.push({ role: 'user', content: message });
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        model: "google/gemini-pro",
                        messages: this.history 
                    })
                });
                if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
                const data = await response.json();
                const text = data.choices[0].message.content;
                this.history.push({ role: 'assistant', content: text });
                
                // Simulate Gemini's stream response for simplicity
                return (async function*() {
                    yield { text };
                })();
            }
        };
    }
};

// --- Teacher AI Co-Pilot ---
export const analyzeClassroomChat = async (provider: AIProvider, classroomTopic: string, studentList: User[], chatMessages: LiveChatMessage[], language: Language, options?: AIOptions) => {
    if (chatMessages.length === 0) {
        const messages = {
            en: "Chat is quiet. Waiting for messages to analyze...",
            pt: "O chat está silencioso. Aguardando mensagens para analisar...",
            ja: "チャットは静かです。分析するメッセージを待っています..."
        }
        return messages[language] || messages.en;
    }
    const prompts = getPrompts(language);

    const simplifiedChat = chatMessages.map(m => `${m.userName} (${m.userRole}): ${m.text}`).join('\n');
    const studentNames = studentList.map(s => s.name);
    const participatingStudentNames = [...new Set(chatMessages.filter(m => m.userRole === 'student').map(m => m.userName))];

    const prompt = prompts.analyzeClassroomChat
        .replace('{classroomTopic}', classroomTopic)
        .replace('{studentRoster}', studentNames.join(', '))
        .replace('{chatHistory}', simplifiedChat)
        .replace('{participatingStudents}', participatingStudentNames.join(', ') || 'None');


    try {
        if (provider === AIProvider.GEMINI) {
            if (!geminiAI) throw new Error("Gemini AI client not initialized.");
            const response = await geminiAI.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return response.text;
        } else if (provider === AIProvider.OLLAMA) {
            if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured.");
            if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
            const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: options.ollamaModel,
                    prompt: prompt,
                    stream: false
                })
            });
            if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
            const data = await response.json();
            return data.response;
        } else { // OpenRouter
            if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured.");
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({ model: "google/gemini-pro", messages: [{ role: "user", content: prompt }] })
            });
            if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
            const data = await response.json();
            return data.choices[0].message.content;
        }
    } catch (error) {
        console.error(`Error analyzing classroom chat with ${provider}:`, error);
        throw new Error(getErrorMessage(provider, language));
    }
};

// --- Adaptive Pathways Generator ---
const adaptivePathwaySchema = {
    type: Type.OBJECT,
    properties: {
        pathways: {
            type: Type.ARRAY,
            description: "An array of 2-3 learning pathways (groups).",
            items: {
                type: Type.OBJECT,
                properties: {
                    groupName: { type: Type.STRING, enum: ['Accelerated', 'Proficient', 'Needs Reinforcement'] },
                    studentIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of student IDs in this group." },
                    studentNames: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of student names in this group for teacher readability." },
                    assignment: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        questionText: { type: Type.STRING },
                                        type: { type: Type.STRING, enum: ['multiple-choice', 'open-ended', 'essay'] },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        answer: { type: Type.STRING }
                                    },
                                    required: ['questionText', 'type', 'answer']
                                }
                            }
                        },
                        required: ['title', 'description', 'questions']
                    }
                },
                required: ['groupName', 'studentIds', 'studentNames', 'assignment']
            }
        }
    },
    required: ['pathways']
};

export const generateAdaptivePathways = async (
    provider: AIProvider,
    topic: string,
    students: User[],
    submissions: Submission[],
    knowledgeGraph: KnowledgeNode[],
    language: Language,
    options?: AIOptions
): Promise<AdaptivePathwayPlan> => {

    const studentPerformanceData = students.map(student => {
        const studentSubmissions = submissions.filter(s => s.studentId === student.id && s.grade !== null);
        const averageGrade = studentSubmissions.length > 0
            ? studentSubmissions.reduce((acc, s) => acc + s.grade!, 0) / studentSubmissions.length
            : null;
        
        const relevantKnowledge = knowledgeGraph
            .filter(k => k.userQuestion.toLowerCase().includes(student.name.toLowerCase()))
            .map(k => k.aiAnswer)
            .slice(0, 2); // Limit to last 2 helpful interactions

        return {
            id: student.id,
            name: student.name,
            averageGrade: averageGrade ? averageGrade.toFixed(1) + '%' : 'N/A',
            recentHelpfulTopics: relevantKnowledge.join('; ') || 'None'
        };
    });

    const prompts = getPrompts(language);
    const prompt = prompts.generateAdaptivePathways
        .replace('{topic}', topic)
        .replace('{studentData}', JSON.stringify(studentPerformanceData, null, 2));


    try {
        if (provider === AIProvider.GEMINI) {
            if (!geminiAI) throw new Error("Gemini AI client not initialized.");
            const response = await geminiAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: adaptivePathwaySchema }
            });
            return JSON.parse(response.text.trim());
        } else if (provider === AIProvider.OLLAMA) {
             if (!OLLAMA_SERVER_URL) throw new Error("Ollama Server URL not configured.");
             if (!options?.ollamaModel) throw new Error("Ollama model not specified.");
              const response = await fetch(`${OLLAMA_SERVER_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: options.ollamaModel,
                    prompt: `${prompt}. Respond ONLY with the raw JSON object, without any surrounding text or markdown. The JSON should conform to this schema: ${JSON.stringify(adaptivePathwaySchema)}`,
                    format: "json",
                    stream: false
                })
            });
            if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);
            const data = await response.json();
            return JSON.parse(data.response);
        } else { // OpenRouter
            if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API Key not configured.");
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "google/gemini-pro",
                    response_format: { type: "json_object" },
                    messages: [{ role: "user", content: `${prompt}. Respond in JSON matching this schema: ${JSON.stringify(adaptivePathwaySchema)}` }]
                })
            });
            if (!response.ok) throw new Error(`OpenRouter API error: ${response.statusText}`);
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        }
    } catch (error) {
        console.error(`Error generating adaptive pathways with ${provider}:`, error);
        throw new Error(getErrorMessage(provider, language));
    }
};