# PromptGiphy

PromptGiphy is a local tool that generates reaction GIFs for social media (such as TikTok comments) from local video files. It extracts audio from a video, transcribes the audio using Groq, determines the best 2-3 second reaction segment using Gemini, and compiles the segment into a captioned, looping GIF using FFmpeg.

## Features

- Local video processing using FFmpeg.
- Audio transcription via Groq Whisper LPU.
- Reaction segment selection and captioning using Gemini 2.5 Flash.
- GIF compilation with custom color palettes and loop delay.

## Architecture and Pipeline

1. **Audio Extraction**: Isolates the audio track of the input video file locally using FFmpeg.
2. **Transcription**: Sends the extracted audio to Groq's Whisper API (`whisper-large-v3-turbo`) to get a text transcript.
3. **Reaction Selection**: Sends the transcript to Gemini 2.5 Flash to identify a highly expressive 2-to-3 second segment and generate a lowercase, casual text caption.
4. **GIF Compilation**: FFmpeg cuts the source video at the target timestamp, scales it to 400px wide, overlays the caption as a subtitle, generates an optimized color palette, and exports an infinite loop GIF.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Runtime**: Node.js
- **Video Utilities**: FFmpeg via fluent-ffmpeg
- **APIs**: Groq SDK and Google Gen AI SDK

## Prerequisites

You must have FFmpeg installed and configured on your system path.

### Installation

#### Windows (using Chocolatey)
```powershell
choco install ffmpeg
```

#### macOS (using Homebrew)
```bash
brew install ffmpeg
```

#### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install ffmpeg
```

## Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   cd promptgiphy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

## Running the Application

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter the absolute path to a local video file (e.g., `C:\Users\Name\Videos\clip.mp4` or `/Users/name/Videos/clip.mp4`) in the input field.
2. Click **Compile Loop**.
3. Once completed, the generated GIF will display on the page. You can download the file or copy the local link to your clipboard.
