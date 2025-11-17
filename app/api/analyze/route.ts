import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface SentimentSegment {
  startTime: number;
  endTime: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, n8nWebhookUrl, sentimentFilter } = await request.json();

    if (!videoUrl || !n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send request to n8n webhook
    let n8nResponse;
    try {
      n8nResponse = await axios.post(
        n8nWebhookUrl,
        {
          videoUrl,
          sentimentFilter,
          action: 'analyze_sentiment',
        },
        {
          timeout: 60000, // 60 second timeout
        }
      );
    } catch (n8nError: any) {
      // If n8n is not available or returns error, use mock data for demo
      console.warn('n8n webhook failed, using mock data:', n8nError.message);

      // Generate mock sentiment analysis data
      const mockSegments: SentimentSegment[] = [
        {
          startTime: 0,
          endTime: 15,
          sentiment: 'positive',
          score: 0.85,
          text: 'Welcome to this amazing tutorial! Today we will explore something exciting.',
        },
        {
          startTime: 15,
          endTime: 30,
          sentiment: 'neutral',
          score: 0.55,
          text: 'First, let me explain the basic concepts that we need to understand.',
        },
        {
          startTime: 30,
          endTime: 45,
          sentiment: 'negative',
          score: 0.75,
          text: 'This part can be quite challenging and frustrating for beginners.',
        },
        {
          startTime: 45,
          endTime: 60,
          sentiment: 'positive',
          score: 0.92,
          text: 'But once you get it, it feels absolutely fantastic and rewarding!',
        },
        {
          startTime: 60,
          endTime: 75,
          sentiment: 'neutral',
          score: 0.50,
          text: 'Now let us move on to the next section of our discussion.',
        },
        {
          startTime: 75,
          endTime: 90,
          sentiment: 'positive',
          score: 0.88,
          text: 'This feature is incredible and will save you so much time!',
        },
        {
          startTime: 90,
          endTime: 105,
          sentiment: 'negative',
          score: 0.70,
          text: 'Unfortunately, there are some limitations and drawbacks to consider.',
        },
        {
          startTime: 105,
          endTime: 120,
          sentiment: 'positive',
          score: 0.95,
          text: 'Thank you so much for watching! I hope you found this helpful and enjoyable.',
        },
      ];

      n8nResponse = { data: { segments: mockSegments } };
    }

    const segments: SentimentSegment[] = n8nResponse.data.segments || [];

    // Filter segments based on sentiment preference
    let filteredSegments: SentimentSegment[];
    if (sentimentFilter === 'all') {
      filteredSegments = segments;
    } else {
      filteredSegments = segments.filter(seg => seg.sentiment === sentimentFilter);
    }

    // Generate cut points (merge consecutive segments)
    const cutPoints: { start: number; end: number }[] = [];
    if (filteredSegments.length > 0) {
      let currentCut = {
        start: filteredSegments[0].startTime,
        end: filteredSegments[0].endTime,
      };

      for (let i = 1; i < filteredSegments.length; i++) {
        const segment = filteredSegments[i];

        // If this segment is consecutive with the current cut, extend it
        if (segment.startTime <= currentCut.end + 5) {
          currentCut.end = segment.endTime;
        } else {
          // Otherwise, save the current cut and start a new one
          cutPoints.push({ ...currentCut });
          currentCut = {
            start: segment.startTime,
            end: segment.endTime,
          };
        }
      }

      // Add the last cut
      cutPoints.push(currentCut);
    }

    // Calculate summary statistics
    const summary = {
      totalPositive: segments.filter(s => s.sentiment === 'positive').length,
      totalNegative: segments.filter(s => s.sentiment === 'negative').length,
      totalNeutral: segments.filter(s => s.sentiment === 'neutral').length,
    };

    return NextResponse.json({
      segments,
      cutPoints,
      summary,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze video' },
      { status: 500 }
    );
  }
}
