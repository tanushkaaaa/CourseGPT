

export async function generateLesson(title, topic) {
    const prompt = `Generate a structured lesson for the course "${title}" on the topic "${topic}". Include:
  - A compelling lesson title
  - A brief description
  - 3 clear learning outcomes
  - Key concepts
  - few engaging activity or example`;
  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or "mistralai/mixtral-8x7b"
        messages: [{ role: "user", content: prompt }],
      }),
    });

    
    
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No result.";
  }


  export async function generateModules(title, topic) {
    const prompt = `Break down the course "${title}" on "${topic}" into 3-5 well-structured modules. For each module, include:
  - Module Title
  - A short overview (2-3 sentences)
  - Prerequisites (if any)
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Estimated time in minutes
  Organize the modules in a logical sequence from easy to advanced. Return the output in readable format.`;
  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No module result.";
  }

  export async function generateSection(title, topic, field) {
    let prompt;
    
    // Create different prompts based on which section is being regenerated
    if (field === "description") {
      prompt = `Write a concise but engaging description for a lesson titled "${title}" on the topic "${topic}". The description should be 2-3 sentences.`;
    } else if (field === "keyConcepts") {
      prompt = `List 4-6 key concepts for a lesson titled "${title}" on the topic "${topic}". Each concept should be clear and concise. Return only the list.`;
    } else if (field === "activities") {
      prompt = `Create 1-2 engaging activities for a lesson titled "${title}" on the topic "${topic}". The activities should be practical and reinforce the lesson's main concepts.`;
    }
  
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });
  
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No result.";
    
    // Process the result based on field type
    if (field === "keyConcepts") {
      // Extract bullet points into an array
      const items = content
        .split(/(?:^|\n)[-•*]\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      return items.length > 0 ? items : [content];
    } else if (field === "activities") {
      // For activities, try to parse as separate activities or return as one
      const activities = content
        .split(/(?:^|\n)(?:Activity \d+:|[\d]+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      return activities.length > 0 ? activities : [content];
    }
    
    return content;
  }
  