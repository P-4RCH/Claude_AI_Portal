// Vercel Serverless Function with File Generation Support
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables.' 
      });
    }

    // Build the conversation history
    const formattedMessages = messages.map(msg => {
      if (msg.files && msg.files.length > 0) {
        // Handle file uploads from user
        const content = [
          { type: 'text', text: msg.content }
        ];
        
        msg.files.forEach(file => {
          if (file.type.startsWith('image/')) {
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type,
                data: file.data
              }
            });
          } else if (file.type === 'application/pdf') {
            content.push({
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: file.data
              }
            });
          }
        });
        
        return {
          role: msg.role,
          content: content
        };
      }
      
      return {
        role: msg.role,
        content: msg.content
      };
    });

    // Enhanced system prompt for file generation
    const systemPrompt = `You are Claude, a helpful AI assistant integrated into a web portal.

When users ask you to create files, documents, or code, you should:
1. Generate the content they requested
2. Wrap the content in special markers so it can be extracted
3. Provide a brief explanation of what you created

For downloadable files, use this format:
<file name="filename.ext" type="mime/type">
base64_encoded_content_here
</file>

For code/text artifacts, use this format:
<artifact title="Artifact Title" language="language">
code_or_text_here
</artifact>

Examples:
- "Create a Python script" → Generate code in <artifact> tags
- "Make me a CSV file" → Generate CSV in <file> tags with base64 encoding
- "Create a text document" → Generate in <file> tags
- "Write me a JSON config" → Generate in <artifact> tags

Always be helpful and create the requested content!`;

    // Make request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API Error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: `API request failed: ${response.statusText}` 
      });
    }

    const data = await response.json();
    const responseText = data.content[0].text;

    // Extract files from response
    const files = [];
    const fileRegex = /<file name="([^"]+)" type="([^"]+)">\s*([\s\S]*?)\s*<\/file>/g;
    let fileMatch;
    
    while ((fileMatch = fileRegex.exec(responseText)) !== null) {
      files.push({
        name: fileMatch[1],
        type: fileMatch[2],
        data: fileMatch[3].trim()
      });
    }

    // Extract artifacts from response
    const artifacts = [];
    const artifactRegex = /<artifact title="([^"]*)"(?: language="([^"]*)")?>\s*([\s\S]*?)\s*<\/artifact>/g;
    let artifactMatch;
    
    while ((artifactMatch = artifactRegex.exec(responseText)) !== null) {
      artifacts.push({
        title: artifactMatch[1],
        language: artifactMatch[2] || 'text',
        content: artifactMatch[3].trim()
      });
    }

    // Remove the file/artifact tags from the response text
    let cleanedResponse = responseText
      .replace(fileRegex, '')
      .replace(artifactRegex, '')
      .trim();

    // Build the response
    const result = {
      content: cleanedResponse
    };

    if (files.length > 0) {
      result.files = files;
    }

    if (artifacts.length > 0) {
      result.artifacts = artifacts;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get response from Claude' 
    });
  }
}
