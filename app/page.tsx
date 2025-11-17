'use client';

import { useState } from 'react';
import axios from 'axios';

interface SentimentSegment {
  startTime: number;
  endTime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  text: string;
}

interface AnalysisResult {
  segments: SentimentSegment[];
  cutPoints: { start: number; end: number }[];
  summary: {
    totalPositive: number;
    totalNegative: number;
    totalNeutral: number;
  };
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'positive' | 'negative' | 'all'>('positive');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!videoUrl || !n8nWebhookUrl) {
      setError('Please provide both video URL and n8n webhook URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/analyze', {
        videoUrl,
        n8nWebhookUrl,
        sentimentFilter,
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Video Sentiment Cutter</h1>
          <p className="text-gray-600 mb-8">Analyze and cut videos based on sentiment using n8n workflows</p>

          <div className="space-y-6">
            {/* Video URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* n8n Webhook URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                n8n Webhook URL
              </label>
              <input
                type="text"
                value={n8nWebhookUrl}
                onChange={(e) => setN8nWebhookUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com/webhook/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Sentiment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keep Segments With
              </label>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="positive">Positive Sentiment</option>
                <option value="negative">Negative Sentiment</option>
                <option value="all">All Sentiments</option>
              </select>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze & Cut Video'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 text-sm font-medium">Positive</div>
                    <div className="text-2xl font-bold text-gray-800">{result.summary.totalPositive}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 text-sm font-medium">Negative</div>
                    <div className="text-2xl font-bold text-gray-800">{result.summary.totalNegative}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-gray-600 text-sm font-medium">Neutral</div>
                    <div className="text-2xl font-bold text-gray-800">{result.summary.totalNeutral}</div>
                  </div>
                </div>

                {/* Cut Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommended Cut Points</h3>
                  <div className="space-y-2">
                    {result.cutPoints.map((cut, idx) => (
                      <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="font-medium text-gray-800">
                          Segment {idx + 1}: {formatTime(cut.start)} - {formatTime(cut.end)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Duration: {formatTime(cut.end - cut.start)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Segments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sentiment Timeline</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.segments.map((segment, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-3 ${
                          segment.sentiment === 'positive'
                            ? 'bg-green-50 border-green-200'
                            : segment.sentiment === 'negative'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800">
                            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            segment.sentiment === 'positive'
                              ? 'bg-green-200 text-green-800'
                              : segment.sentiment === 'negative'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {segment.sentiment} ({(segment.score * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How to Use</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">1</span>
              <span>Set up an n8n workflow with a webhook trigger that accepts video URLs and returns sentiment analysis</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">2</span>
              <span>Enter your video URL (the video should have audio/captions for sentiment analysis)</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">3</span>
              <span>Paste your n8n webhook URL</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">4</span>
              <span>Choose which sentiment segments to keep in the final cut</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">5</span>
              <span>Click "Analyze & Cut Video" to get recommended cut points based on sentiment</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
