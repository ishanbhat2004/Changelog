import { NextRequest, NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

// Check if the environment variable is loaded
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY);

if (!process.env.HUGGINGFACE_API_KEY) {
  console.error('Hugging Face API Key is missing. Check your .env file.');
}

// Initialize Hugging Face Inference API
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');
console.log('Hugging Face Response:', hf);

// POST handler for the /api/generate route
export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    console.log('Received request'); // Log when a request is received
    const { repoUrl, since } = await request.json();
    console.log('Request body:', { repoUrl, since }); // Log the request body

    if (!repoUrl || !since) {
      return NextResponse.json(
        { error: 'Both "repoUrl" and "since" fields are required.' },
        { status: 400 }
      );
    }

    // Create a temporary directory for cloning the repository
    tempDir = await mkdtemp(join(tmpdir(), 'repo-'));
    console.log('Temporary directory created:', tempDir); // Log the temp directory

    // Clone the repository
    const git = simpleGit(tempDir);
    await git.clone(repoUrl, tempDir);
    console.log('Repository cloned'); // Log after cloning

    // Fetch the log since the specified date and limit the number of commits
    const log = await git.log({
      '--since': since,
      '--max-count': 10,
    });
    console.log('Git log fetched:', log); // Log the git log

    if (log.all.length === 0) {
      return NextResponse.json(
        { error: `No commits found since ${since} for the repository.` },
        { status: 404 }
      );
    }

    // Limit and clean commit messages
    const maxCommits = 5; // Limit the number of commits
    const truncate = (message: string, length = 100) =>
      message.length > length ? `${message.slice(0, length)}...` : message;
    const filteredCommits = log.all.slice(0, maxCommits);
    const commitMessages = filteredCommits
      .map(commit => `- ${truncate(commit.message)}`)
      .join('\n');

    // Improved prompt
    // 
    const prompt = `Summarize the following commit messages for the repository at https://github.com/ishanbhat2004/NeuralNetworks since 2021-01-01:\n\n${commitMessages}`;
    console.log('Prepared prompt for Hugging Face:', prompt);
    
    const hfResponse = await hf.summarization({
        model: 'codeparrot/code-summarization',
        inputs: prompt,
        parameters: { max_length: 100, temperature: 0.7 },
    });
      
    

    const summary = hfResponse.summary_text
      ? hfResponse.summary_text.trim()
      : 'No significant changes summarized.';
    console.log('Processed Summary:', summary); // Log the processed summary

    // Build the changelog
    const changelog = {
      raw: log.all.map(commit => ({
        commit: commit.hash,
        message: commit.message,
      })),
      summary: summary || 'No summary generated.',
      commitCount: log.all.length,
      repoUrl,
      since,
    };

    // Clean up the temporary directory
    await rm(tempDir, { recursive: true, force: true });
    console.log('Temporary directory cleaned up'); // Log after cleanup

    return NextResponse.json(changelog);
  } catch (error: any) {

    // Clean up the temporary directory in case of an error
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}