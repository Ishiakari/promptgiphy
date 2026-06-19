#  PromptGiphy

**PromptGiphy** is a lightweight, ultra-fast, local-first AI Meme GIF Generator. By feeding it a path to a local video file, the application automatically extracts the audio, transcribes it using blazing-fast hardware acceleration, uses an LLM to interpret comedic timing, selects a high-potential looping window, and burns a stylized meme caption directly onto a finalized `.gif` export. 

Built specifically for personal, zero-cost use by leveraging generous developer free-tiers.

---

##  How It Works (The Pipeline)

1. **Local Media Splitting:** The backend feeds your input file into local system binaries to isolate and pull the audio track without touching cloud media storage.
2. **LPU Transcription:** The audio slice is dispatched to the **Groq Whisper** engine, handling multi-minute video transcriptions in fractions of a second.
3. **Comedic Comprehension:** The raw text and timestamp payload are sent to **Gemini 2.5 Flash** with an injection prompt to detect high-context reaction windows and author custom punchlines.
4. **Fidelity Compilation:** **FFmpeg** cuts the exact timestamp window, overlays classic tracking typography, isolates a balanced custom dynamic color map palette, and compiles the high-fidelity infinite loop GIF.

---

##  The Tech Stack

- **Frontend Core:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling Shell:** [Tailwind CSS](https://tailwindcss.com/)
- **Core Runtime:** [Node.js](https://nodejs.org/)
- **Processing Engine:** System-level [FFmpeg](https://ffmpeg.org/) via `fluent-ffmpeg`
- **Transcription Layer:** [Groq Cloud SDK](https://console.groq.com/) (`whisper-large-v3-turbo`)
- **LLM Context Brain:** [Google Gen AI SDK](https://aistudio.google.com/) (`gemini-2.5-flash`)

---

##  Prerequisites & Installation

### 1. Install System FFmpeg
PromptGiphy depends on globally mapped FFmpeg system paths to execute core video manipulation operations.

#### **Windows (Using Chocolatey)**
Open PowerShell as an **Administrator** and run:
```powershell
choco install ffmpeg
