"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Globe,
  Settings,
  Youtube,
  Loader2,
} from "lucide-react";
import { dubverseClient } from "@/lib/dubverse";

interface Language {
  code: string;
  name: string;
}

const POPULAR_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Mandarin)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export default function YouTubeDubbingTool() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableLanguages, setAvailableLanguages] =
    useState<Language[]>(POPULAR_LANGUAGES);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [dubbingStatus, setDubbingStatus] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string>("");

  const videoRef = useRef<HTMLIFrameElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Load available languages from Dubverse API
    loadLanguages();
    // Load existing API key
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const response = await fetch("/api/get-dubverse-key");
      if (response.ok) {
        const data = await response.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
          setKeyStatus("API key loaded");
        }
      }
    } catch (error) {
      console.error("Failed to load API key:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.trim() === "") {
      setKeyStatus("Please enter an API key");
      return;
    }

    setIsSavingKey(true);
    setKeyStatus("Saving API key...");

    try {
      const response = await fetch("/api/save-dubverse-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setKeyStatus("API key saved successfully!");
        setTimeout(() => setKeyStatus(""), 3000);
      } else {
        setKeyStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to save API key:", error);
      setKeyStatus("Failed to save API key. Please try again.");
    } finally {
      setIsSavingKey(false);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await dubverseClient.getLanguages();
      if (response.data) {
        setAvailableLanguages(response.data);
      }
    } catch (error) {
      console.error("Failed to load languages:", error);
      // Fallback to popular languages
      setAvailableLanguages(POPULAR_LANGUAGES);
    }
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control the YouTube iframe
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // In a real implementation, this would send audio to OpenAI Whisper
          // via MCP server for transcription
          console.log("Audio chunk received:", event.data);
        }
      };
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStartDubbing = async () => {
    if (!youtubeUrl) {
      alert("Please enter a YouTube URL");
      return;
    }

    setIsProcessing(true);
    setDubbingStatus("Creating project...");

    try {
      // Create a new dubbing project
      const projectResponse = await dubverseClient.createProject({
        name: `YouTube Dubbing - ${new Date().toISOString()}`,
        source_language: sourceLanguage === "auto" ? "en" : sourceLanguage,
        target_language: targetLanguage,
        video_url: youtubeUrl,
      });

      if (projectResponse.error) {
        throw new Error(projectResponse.error);
      }

      const projectId = projectResponse.data?.id;
      if (!projectId) {
        throw new Error("Failed to create project");
      }

      setCurrentProject(projectId);
      setDubbingStatus("Starting dubbing process...");

      // Start the dubbing process
      const dubbingResponse = await dubverseClient.startDubbing(projectId, {
        speed: playbackSpeed[0],
      });

      if (dubbingResponse.error) {
        throw new Error(dubbingResponse.error);
      }

      setDubbingStatus("Dubbing in progress...");

      // Poll for completion (in a real app, you'd use webhooks)
      pollDubbingStatus(projectId);
    } catch (error) {
      console.error("Dubbing failed:", error);
      setDubbingStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const pollDubbingStatus = async (projectId: string) => {
    const checkStatus = async () => {
      try {
        const response = await dubverseClient.getProject(projectId);
        if (response.data) {
          const status = response.data.status;
          setDubbingStatus(`Status: ${status}`);

          if (status === "completed") {
            setDubbingStatus("Dubbing completed! Audio is ready.");
            return;
          } else if (status === "failed") {
            setDubbingStatus("Dubbing failed. Please try again.");
            return;
          }
        }

        // Continue polling
        setTimeout(checkStatus, 5000);
      } catch (error) {
        console.error("Status check failed:", error);
        setDubbingStatus("Status check failed");
      }
    };

    checkStatus();
  };

  const videoId = extractVideoId(youtubeUrl);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6 bg-white">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Youtube className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">
            YouTube Live Translation Dubbing Tool
          </h1>
        </div>
        <p className="text-muted-foreground">
          Real-time translation and dubbing for any YouTube video with 250+
          language support
        </p>
      </div>

      {/* YouTube URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            YouTube Video
          </CardTitle>
          <CardDescription>
            Enter a YouTube URL to start dubbing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleStartDubbing}
              disabled={!youtubeUrl || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing
                </>
              ) : (
                "Start Dubbing"
              )}
            </Button>
          </div>

          {dubbingStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{dubbingStatus}</p>
            </div>
          )}

          {/* API Key Management */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="font-medium">Dubverse API Key</h3>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your Dubverse API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 font-mono"
              />
              <Button
                onClick={handleSaveApiKey}
                disabled={isSavingKey || !apiKey.trim()}
                className="min-w-[100px]"
              >
                {isSavingKey ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Key"
                )}
              </Button>
            </div>
            {keyStatus && (
              <div
                className={`p-2 rounded text-sm ${
                  keyStatus.includes("Error") || keyStatus.includes("Failed")
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : keyStatus.includes("successfully")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}
              >
                {keyStatus}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Player */}
      {videoId && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe
                ref={videoRef}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Source Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audio Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Audio Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Volume: {volume[0]}%</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVolumeToggle}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                  disabled={isMuted}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Playback Speed: {playbackSpeed[0]}x</Label>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Audio Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Live Audio Capture
          </CardTitle>
          <CardDescription>
            Capture live audio for real-time transcription and translation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>

            {isRecording && (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {currentProject && (
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Project ID: {currentProject}
              </p>
              <p className="text-sm">
                Status: {dubbingStatus || "Initializing..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
