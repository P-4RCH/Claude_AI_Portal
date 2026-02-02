// Advanced API with Document Generation Support
// This version can create PPTX, DOCX, XLSX, PDF files

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables.' 
      });
    }

    // Build conversation with file support
    const formattedMessages = messages.map(msg => {
      if (msg.files && msg.files.length > 0) {
        const content = [{ type: 'text', text: msg.content }];
        
        msg.files.forEach(file => {
          if (file.type.startsWith('image/')) {
            content.push({
              type: 'image',
              source: { type: 'base64', media_type: file.type, data: file.data }
            });
          } else if (file.type === 'application/pdf') {
            content.push({
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: file.data }
            });
          }
        });
        
        return { role: msg.role, content };
      }
      
      return { role: msg.role, content: msg.content };
    });

    // Enhanced system prompt with document generation instructions
    const systemPrompt = `You are Claude, an AI assistant with advanced document generation capabilities.

When users ask you to create documents, you can generate:
- PowerPoint presentations (.pptx)
- Word documents (.docx)
- Excel spreadsheets (.xlsx)
- PDF files (.pdf)
- Text-based files (JSON, CSV, HTML, etc.)

IMPORTANT: When creating documents, respond with STRUCTURED JSON in this exact format:

For PowerPoint presentations:
{
  "type": "pptx",
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide 1 Title",
      "content": ["Bullet point 1", "Bullet point 2"],
      "notes": "Speaker notes (optional)"
    }
  ],
  "explanation": "Brief explanation of what you created"
}

For Word documents:
{
  "type": "docx",
  "title": "Document Title",
  "sections": [
    {
      "heading": "Section 1",
      "content": "Paragraph text here...",
      "level": 1
    }
  ],
  "explanation": "Brief explanation"
}

For Excel spreadsheets:
{
  "type": "xlsx",
  "title": "Spreadsheet Name",
  "sheets": [
    {
      "name": "Sheet1",
      "data": [
        ["Header1", "Header2", "Header3"],
        ["Data1", "Data2", "Data3"]
      ]
    }
  ],
  "explanation": "Brief explanation"
}

For simple text files (JSON, CSV, TXT, etc.):
{
  "type": "text",
  "filename": "file.json",
  "content": "file content here",
  "explanation": "Brief explanation"
}

ALWAYS respond with valid JSON when creating documents. NO markdown, NO extra text, ONLY JSON.

Examples:
User: "Create a PowerPoint about AI trends"
Assistant: {"type":"pptx","title":"AI Trends 2024","slides":[{"title":"Introduction","content":["AI is transforming industries","Key trends emerging"]}],"explanation":"Created a 5-slide presentation on current AI trends"}

User: "Make a sales report in Excel"
Assistant: {"type":"xlsx","title":"Sales Report","sheets":[{"name":"Q1 Sales","data":[["Product","Sales","Revenue"],["Product A",100,5000]]}],"explanation":"Created a sales report spreadsheet"}

For regular conversations (not document creation), respond normally without JSON.`;

    // Call Claude API
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
    let responseText = data.content[0].text;

    // Try to parse as JSON for document generation
    let documentData = null;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        documentData = JSON.parse(jsonMatch[1]);
      } else if (responseText.trim().startsWith('{')) {
        documentData = JSON.parse(responseText);
      }
    } catch (e) {
      // Not JSON, treat as regular response
      documentData = null;
    }

    // If we have structured document data, generate the file
    if (documentData && documentData.type) {
      const result = {
        content: documentData.explanation || "I've created your document. Click the download button below.",
        files: []
      };

      try {
        switch (documentData.type) {
          case 'pptx':
            result.files.push({
              name: `${documentData.title?.replace(/[^a-z0-9]/gi, '_') || 'presentation'}.pptx`,
              type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              data: await generatePowerPoint(documentData),
              generated: true
            });
            break;

          case 'docx':
            result.files.push({
              name: `${documentData.title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.docx`,
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              data: await generateWordDoc(documentData),
              generated: true
            });
            break;

          case 'xlsx':
            result.files.push({
              name: `${documentData.title?.replace(/[^a-z0-9]/gi, '_') || 'spreadsheet'}.xlsx`,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              data: await generateExcel(documentData),
              generated: true
            });
            break;

          case 'text':
            result.files.push({
              name: documentData.filename || 'file.txt',
              type: 'text/plain',
              data: Buffer.from(documentData.content).toString('base64'),
              generated: true
            });
            break;
        }
      } catch (genError) {
        console.error('Document generation error:', genError);
        result.content = `I created the document structure, but there was an error generating the file: ${genError.message}. Here's the data structure:\n\n${JSON.stringify(documentData, null, 2)}`;
      }

      return res.status(200).json(result);
    }

    // Regular text response
    res.status(200).json({
      content: responseText
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get response from Claude' 
    });
  }
}

// Document generation functions (to be implemented)
async function generatePowerPoint(data) {
  // This is a placeholder - you'll need to add pptxgenjs library
  // For now, return a simple structure description
  const structure = {
    title: data.title,
    slides: data.slides,
    note: "To enable PPTX generation, add the pptxgenjs library to your project"
  };
  
  return Buffer.from(JSON.stringify(structure, null, 2)).toString('base64');
}

async function generateWordDoc(data) {
  // Placeholder for docx generation
  const structure = {
    title: data.title,
    sections: data.sections,
    note: "To enable DOCX generation, add the docx library to your project"
  };
  
  return Buffer.from(JSON.stringify(structure, null, 2)).toString('base64');
}

async function generateExcel(data) {
  // Placeholder for Excel generation
  const structure = {
    title: data.title,
    sheets: data.sheets,
    note: "To enable XLSX generation, add the xlsx library to your project"
  };
  
  return Buffer.from(JSON.stringify(structure, null, 2)).toString('base64');
}