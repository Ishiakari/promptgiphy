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
                 Identify a funny 3-to-4 second timestamp window that has high reaction/meme potential.
                 Return the exact starting timestamp in seconds, along with a top-text caption.
                 Return your response strictly inside a clean JSON object format:
                 {"startTime": 14.2, "caption": "YOUR MEME TEXT HERE"}`
    });

    const jsonText = aiResponse.text?.replace(/```json|```/g, '').trim() || '{}';
    const memeConfig = JSON.parse(jsonText);

    // 4. Compile the optimized, looped GIF locally using FFmpeg palettes
    await new Promise((resolve, reject) => {
      ffmpeg(cleanPath)
        .setStartTime(memeConfig.startTime)
        .setDuration(4)
        .videoFilters([
          'scale=500:-1', // Fast-loading 500px scale width
          {
            filter: 'drawtext',
            options: {
              text: memeConfig.caption.toUpperCase(),
              fontcolor: 'white',
              fontsize: 24,
              borderw: 3,
              bordercolor: 'black',
              x: '(w-text_w)/2',
              y: '20'
            }
          },
          'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'
        ])
        .outputOptions(['-loop 0'])
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