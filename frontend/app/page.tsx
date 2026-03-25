"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  RefreshCw,
  Info,
  Sparkles,
  Zap,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnalysisResponse {
  summary: string;
  metadata: {
    filename: string;
    content_type: string;
    size_bytes: number;
  };
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "analyzing" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [promptText, setPromptText] = useState(
    "Please summarize this document comprehensively.",
  );
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/health`,
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);
        setIsBackendOnline(res.ok);
      } catch (e) {
        setIsBackendOnline(false);
      }
    };

    // Initial check
    checkHealth();

    // Poll every 60 seconds
    const intervalId = setInterval(checkHealth, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (!selectedFile) return;

      if (
        selectedFile.type !== "application/pdf" &&
        selectedFile.type !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        !selectedFile.name.endsWith(".pdf") &&
        !selectedFile.name.endsWith(".docx")
      ) {
        toast.error("Unsupported file type. Please upload a PDF or DOCX.");
        return;
      }

      setFile(selectedFile);
      await handleUpload(selectedFile, promptText);
    },
    [promptText],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const handleUpload = async (fileToUpload: File, prompt: string) => {
    setStatus("analyzing");

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("prompt", prompt);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/documents/analyze",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data: AnalysisResponse = await res.json();
      setResult(data);
      setStatus("success");
      toast.success("Analysis complete");
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred during analysis.",
      );
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStatus("idle");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <TooltipProvider delay={200}>
      <div className="min-h-screen bg-slate-50/50 text-slate-900 p-6 pb-0 md:p-12 md:pb-0 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col relative overflow-hidden">
        {/* Decorative background grid and blurs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute -top-[300px] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]"></div>
        </div>
        <header className="w-full mx-auto relative z-10 flex flex-col items-center justify-center pt-10 pb-16 md:pt-16 md:pb-24">
          {/* Top Right Badges (absolute on desktop, absolute on mobile top-right) */}
          <div className="absolute top-4 right-4 md:top-0 md:right-0 flex items-center gap-3 z-50">
            {isBackendOnline !== null && (
              <Tooltip>
                <TooltipTrigger
                  className={
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm transition-colors outline-none cursor-pointer " +
                    (isBackendOnline
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100")
                  }
                >
                  {isBackendOnline ? (
                    <Wifi className="w-3.5 h-3.5" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isBackendOnline ? "System Online" : "System Offline"}
                  </span>
                  <span className="sm:hidden">
                    {isBackendOnline ? "Online" : "Offline"}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-800 text-white border-none shadow-xl max-w-xs text-center"
                >
                  {isBackendOnline
                    ? "Backend is connected and ready to process documents."
                    : "Cannot reach the analysis server. Please ensure the backend is running."}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center gap-6"
          >
            <div className="text-center space-y-2">
              <h1 className="font-serif text-5xl sm:text-7xl md:text-[5.5rem] font-bold text-slate-900 tracking-tight leading-none">
                PaperMind
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium tracking-[0.2em] uppercase mt-2">
                Intelligent Document Analysis
              </p>
            </div>
          </motion.div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 pb-12">
          {/* Left Column: Info & How it works */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Badge className="w-fit mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-5 py-2 shadow-sm rounded-full text-sm font-semibold tracking-wide">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-7" /> Powered by Gemini 3.1
              </span>
            </Badge>

            <h2 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Transform documents into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                actionable insights.
              </span>
            </h2>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-light">
              PaperMind reads, comprehends, and distills your complex PDFs and
              Word documents in seconds using state-of-the-art AI.
            </p>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              <div className="relative flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-blue-200 shadow-sm flex items-center justify-center text-blue-600 z-10">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-semibold text-slate-900 text-lg">
                    1. Upload your file
                  </h4>
                  <p className="text-slate-600 mt-1.5 leading-relaxed text-sm">
                    Drag and drop your PDF or DOCX file securely into the
                    portal. We handle files rapidly for instant processing.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center text-amber-500 z-10">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-semibold text-slate-900 text-lg">
                    2. Set your directive
                  </h4>
                  <p className="text-slate-600 mt-1.5 leading-relaxed text-sm">
                    Tell the AI exactly what you want—a summary, extraction of
                    key data points, or a critical review of the content.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-purple-200 shadow-sm flex items-center justify-center text-purple-600 z-10">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="pt-1.5">
                  <h4 className="font-semibold text-slate-900 text-lg">
                    3. Get instant results
                  </h4>
                  <p className="text-slate-600 mt-1.5 leading-relaxed text-sm">
                    Review the AI-generated insights in a beautifully formatted
                    markdown view, ready to copy, read, and share.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {status === "idle" || status === "error" ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="border-slate-200/60 shadow-2xl shadow-indigo-100/30 bg-white/80 backdrop-blur-xl overflow-hidden rounded-3xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-6 px-6 sm:px-8 pt-8">
                      <CardTitle className="text-2xl font-serif text-slate-800">
                        New Analysis
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Configure your prompt and upload a document to begin.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                          <label className="block text-sm font-semibold uppercase tracking-wider text-slate-700">
                            Analysis Directive
                          </label>
                          <Tooltip>
                            <TooltipTrigger className="text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer outline-none bg-transparent border-none p-0 flex items-center justify-center">
                              <Info className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="bg-slate-800 text-white border-none shadow-xl max-w-xs"
                            >
                              <p className="text-sm">
                                Instruct the AI on what to look for. You can ask
                                for summaries, extract specific tables, or
                                translate the content.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <textarea
                          rows={3}
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-800 transition-all text-base resize-none shadow-sm"
                          placeholder="E.g., Please summarize this document..."
                        />
                      </div>

                      <div
                        {...getRootProps()}
                        className={`group relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-out cursor-pointer overflow-hidden p-8 sm:p-12
                          ${isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80"}`}
                      >
                        <input {...getInputProps()} />

                        <motion.div
                          initial={false}
                          animate={{ scale: isDragActive ? 1.05 : 1 }}
                          className="z-10 flex flex-col items-center text-center space-y-4"
                        >
                          <div
                            className={`p-4 rounded-2xl shadow-sm border transition-all duration-300 ${isDragActive ? "bg-indigo-500 border-indigo-600 text-white" : "bg-white border-slate-200 text-indigo-500 group-hover:scale-110"}`}
                          >
                            <UploadCloud
                              className="w-8 h-8"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-slate-800 mb-1">
                              {isDragActive
                                ? "Drop the file to upload"
                                : "Click or drag file to this area"}
                            </p>
                            <p className="text-sm text-slate-500">
                              Strictly PDF or DOCX files allowed.
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : status === "analyzing" ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-100/30"
                >
                  <div className="relative w-28 h-28 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                      <RefreshCw
                        className="w-8 h-8 animate-pulse"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <h3 className="font-serif text-3xl text-slate-800 mb-3">
                    Analyzing Document
                  </h3>
                  <p className="text-slate-500 font-light text-lg flex items-center justify-center gap-2 max-w-sm px-6 truncate">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{file?.name}</span>
                  </p>
                </motion.div>
              ) : status === "success" && result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="border-emerald-200 shadow-2xl shadow-emerald-100/40 bg-white overflow-hidden rounded-3xl">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-5 px-6 sm:px-8 pt-8 flex flex-row items-center justify-between">
                      <div className="space-y-1 overflow-hidden pr-4">
                        <CardTitle className="text-xl font-serif text-emerald-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          Analysis Complete
                        </CardTitle>
                        <CardDescription className="text-emerald-700 font-medium truncate">
                          {result.metadata.filename}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-white border-emerald-200 text-emerald-700 shadow-sm px-3 py-1 flex-shrink-0 rounded-full"
                      >
                        {formatBytes(result.metadata.size_bytes)}
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent hover:scrollbar-thumb-emerald-300">
                      <div className="prose prose-slate prose-headings:font-serif prose-headings:text-slate-800 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-indigo-600 prose-li:text-slate-600 max-w-none">
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t border-slate-100 p-6">
                      <button
                        onClick={reset}
                        className="w-full py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Analyze Another Document
                      </button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-6xl mx-auto py-6 mt-auto flex justify-center items-center border-t border-slate-200/60 relative z-10">
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Built by{" "}
            <span className="text-slate-900 font-semibold font-serif italic">
              Able Abenaitwe
            </span>
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
