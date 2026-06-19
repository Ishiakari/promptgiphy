import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { videoPath } = await request.json();

    // Clean up the path strings if windows adds quotes around copy-pasted files
    const cleanPath = videoPath.replace(/^"|"$/g, '');

    if (!fs.existsSync(cleanPath)) {
      return NextResponse.json({ error: `File not found at: ${cleanPath}` }, { status: 400 });
    }

    // Set up output targets inside Next.js public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    const tempAudioPath = path.join(publicDir, 'temp_audio.mp3');
    const filename = `meme_${Date.now()}.gif`;
    const outputGifPath = path.join(publicDir, filename);

    // 1. Extract Audio track locally using your system FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(cleanPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .output(tempAudioPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // 2. Transcribe the audio file for free via Groq Whisper LPU
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempAudioPath),
      model: 'whisper-large-v3-turbo',
    });

    // Housekeeping: Erase temporary audio file right away
    if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);

    // 3. Prompt Gemini to locate the funny punchline window
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this video audio transcript: "${transcription.text}".
Your goal is to turn this uploaded video clip into a viral, low-context TikTok comment reaction asset. 
Identify a highly expressive 2-to-3 second window (screaming, crying, staring, laughing, processing).

Write a short, completely lowercase caption that makes this clip a perfect reaction asset to reply to unhinged social media posts.

CRITICAL TIKTOK COMMENT META RULES:
- NEVER use punctuation, capital letters, or hashtags unless it's a keyboard smash/emoji (e.g., "😭", "💀").
- Write it like a real person typing a fast, low-effort reply.
- DO NOT use corny or outdated cliches (e.g., "no god please no", "when you do x").
- Examples of the exact vibe:
  * "bro thought he did something"
  * "i know he lyin"
  * "delete this immediately"
  * "me processing what i just read"
  * "alr bro be serious"
  * "bro cannot be real right now"

Return your response strictly inside a clean JSON object format:
{"startTime": 14.2, "caption": "your caption here"}`
    });

    const text = aiResponse.text || '{}';
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const jsonText = firstBrace !== -1 && lastBrace !== -1 
      ? text.substring(firstBrace, lastBrace + 1)
      : '{}';
    const memeConfig = JSON.parse(jsonText);

    // Escape single quotes for the FFmpeg drawtext filter graph to prevent parsing crashes
    const safeCaption = (memeConfig.caption || '').replace(/'/g, "'\\''");

    // 4. Compile the optimized, looped GIF locally using FFmpeg palettes
    await new Promise((resolve, reject) => {
      ffmpeg(cleanPath)
        .setStartTime(memeConfig.startTime)
        .setDuration(3) // 3 seconds max for the perfect comment section loop speed
        .videoFilters([
          'scale=400:-1', // Scale width slightly down for tight GIF compression size limits
          
          // Draw text cleanly at the bottom like a real stream clip subtitle overlay
          {
            filter: 'drawtext',
            options: {
              text: `'${safeCaption}'`, // Wrapped in single quotes to handle spaces and colons safely
              fontcolor: 'white',
              fontsize: 18,
              fontfile: "'C\\:/Windows/Fonts/Arial.ttf'", // Single-quoted to escape the Windows drive letter colon
              // Box overlay gives it that faint dark backing band for crisp readability
              box: 1,
              boxcolor: 'black@0.6',
              boxborderw: 5,
              x: '(w-text_w)/2',
              y: 'h-th-20' // Beautifully padded right at the bottom edge
            }
          },
          
          // Build a perfect custom color palette so the GIF colors pop flawlessly on phone screens
          'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'
        ])
        .outputOptions([
          '-loop 0',       // Infinite loop
          '-final_delay 2' // Tiny pause at the loop seam for perfect timing
        ])
        .output(outputGifPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    return NextResponse.json({ 
      success: true, 
      gifUrl: `/${filename}`,
      config: memeConfig 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}