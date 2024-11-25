import { NextRequest, NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm } from 'fs/promises';
import { openDb, initializeDb } from '../../db'; // Import the database functions
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || '');

export async function GET() {
  try {
    await initializeDb();
    const db = await openDb();
    const changelogs = await db.all('SELECT * FROM changelogs ORDER BY created_at DESC');
    return NextResponse.json(changelogs);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching changelogs:', error.message, error.stack);
      return NextResponse.json({ error: 'Failed to fetch changelogs.' }, { status: 500 });
    } else {
      console.error('Unknown error fetching changelogs');
      return NextResponse.json({ error: 'Failed to fetch changelogs.' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    await initializeDb(); // Ensure database schema is initialized
    const db = await openDb(); // Open the database connection

    const { repoUrl, since } = await request.json();
    if (!repoUrl || !since) {
      return NextResponse.json(
        { error: 'Both "repoUrl" and "since" fields are required.' },
        { status: 400 }
      );
    }

    // Create a temporary directory for cloning the repository
    tempDir = await mkdtemp(join(tmpdir(), 'repo-'));
    const git = simpleGit(tempDir);
    await git.clone(repoUrl, tempDir);

    // Fetch git logs
    const log = await git.log({ '--since': since, '--max-count': 10 });
    if (log.all.length === 0) {
      return NextResponse.json({ error: `No commits found since ${since}.` }, { status: 404 });
    }

    // Prepare the commit messages for summarization
    const commitMessages = log.all
      .slice(0, 5)
      .map(commit => `- ${commit.message.slice(0, 100)}`)
      .join('\n');
    const prompt = `Summarize the following commits for ${repoUrl} since ${since}:\n\n${commitMessages}`;

    // Hugging Face API summarization
    const hfResponse = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: prompt,
    });

    const summary = hfResponse.summary_text?.trim() || 'No significant changes summarized.';
    const changelog = {
      raw: log.all.map(commit => ({ commit: commit.hash, message: commit.message })),
      summary,
      repoUrl,
      since,
    };

    // Save the changelog to the database
    await db.run(
      'INSERT INTO changelogs (repo_url, since_date, raw_commits, summary) VALUES (?, ?, ?, ?)',
      [repoUrl, since, JSON.stringify(changelog.raw), summary]
    );

    return NextResponse.json(changelog);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in POST /api/generate:', error.message);
      console.error('Stack trace:', error.stack);
    } else {
      console.error('Unknown error in POST /api/generate');
    }

    // Clean up the temporary directory in case of an error
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
      console.log('Temporary directory cleaned up');
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
