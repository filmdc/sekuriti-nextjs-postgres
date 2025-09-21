import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/next-auth';
import { db } from '@/lib/db/drizzle';
import { exerciseCompletions, tabletopExercises } from '@/lib/db/schema-ir';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const completionId = parseInt(params.id);
    if (isNaN(completionId)) {
      return NextResponse.json({ error: 'Invalid completion ID' }, { status: 400 });
    }

    // Get completion details
    const [completion] = await db
      .select({
        completion: exerciseCompletions,
        exercise: tabletopExercises,
        user: users
      })
      .from(exerciseCompletions)
      .innerJoin(tabletopExercises, eq(tabletopExercises.id, exerciseCompletions.exerciseId))
      .innerJoin(users, eq(users.id, exerciseCompletions.userId))
      .where(eq(exerciseCompletions.id, completionId))
      .limit(1);

    if (!completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
    }

    // Verify user owns this completion
    if (completion.completion.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate score percentage
    const scorePercentage = Math.round(
      (completion.completion.score / completion.completion.totalScore) * 100
    );

    // Check if passed (70% or higher)
    if (scorePercentage < 70) {
      return NextResponse.json(
        { error: 'Certificate requires a score of 70% or higher' },
        { status: 400 }
      );
    }

    // Generate HTML certificate
    const certificateHtml = generateCertificateHTML({
      userName: completion.user.name || completion.user.email,
      exerciseTitle: completion.exercise.title,
      completedAt: completion.completion.completedAt!,
      score: scorePercentage,
      certificateId: `CERT-${completionId.toString().padStart(6, '0')}`
    });

    // Return HTML response with appropriate headers for printing/downloading
    return new NextResponse(certificateHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="certificate-${completion.exercise.title.replace(/\s+/g, '-')}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

function generateCertificateHTML({
  userName,
  exerciseTitle,
  completedAt,
  score,
  certificateId
}: {
  userName: string;
  exerciseTitle: string;
  completedAt: Date;
  score: number;
  certificateId: string;
}) {
  const completionDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion - ${exerciseTitle}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;600&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Open Sans', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .certificate {
            background: white;
            width: 100%;
            max-width: 800px;
            aspect-ratio: 1.414;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            position: relative;
            overflow: hidden;
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
        }

        .certificate::after {
            content: '';
            position: absolute;
            inset: 20px;
            border: 3px solid #fbbf24;
            border-radius: 10px;
            pointer-events: none;
        }

        .logo {
            text-align: center;
            margin-bottom: 40px;
        }

        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            color: #1f2937;
            position: relative;
            display: inline-block;
        }

        .logo h1::after {
            content: 'SEKURITI.IO';
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: -20px;
            font-size: 14px;
            letter-spacing: 4px;
            color: #6b7280;
        }

        .title {
            text-align: center;
            margin: 60px 0 40px;
        }

        .title h2 {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            color: #1f2937;
            margin-bottom: 10px;
        }

        .title p {
            color: #6b7280;
            font-size: 18px;
            letter-spacing: 2px;
        }

        .content {
            text-align: center;
            margin: 40px 0;
        }

        .content p {
            font-size: 18px;
            color: #4b5563;
            margin: 20px 0;
        }

        .recipient {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            color: #1f2937;
            margin: 30px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #fbbf24;
            display: inline-block;
        }

        .exercise-title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 20px 0;
        }

        .details {
            display: flex;
            justify-content: center;
            gap: 60px;
            margin: 40px 0;
        }

        .detail {
            text-align: center;
        }

        .detail-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #9ca3af;
            margin-bottom: 5px;
        }

        .detail-value {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
        }

        .badge {
            position: absolute;
            bottom: 60px;
            right: 60px;
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 10px 25px -5px rgba(251, 191, 36, 0.5);
        }

        .badge-score {
            font-size: 32px;
            font-weight: bold;
            color: white;
        }

        .badge-label {
            font-size: 12px;
            color: white;
            opacity: 0.9;
        }

        .certificate-id {
            position: absolute;
            bottom: 30px;
            left: 60px;
            font-size: 12px;
            color: #9ca3af;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .certificate {
                box-shadow: none;
                border-radius: 0;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="logo">
            <h1>Certificate</h1>
        </div>

        <div class="title">
            <h2>Certificate of Achievement</h2>
            <p>INCIDENT RESPONSE TRAINING</p>
        </div>

        <div class="content">
            <p>This is to certify that</p>
            <div class="recipient">${userName}</div>
            <p>has successfully completed the training exercise</p>
            <div class="exercise-title">"${exerciseTitle}"</div>

            <div class="details">
                <div class="detail">
                    <div class="detail-label">Date Completed</div>
                    <div class="detail-value">${completionDate}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Final Score</div>
                    <div class="detail-value">${score}%</div>
                </div>
            </div>
        </div>

        <div class="badge">
            <div class="badge-score">${score}%</div>
            <div class="badge-label">SCORE</div>
        </div>

        <div class="certificate-id">${certificateId}</div>
    </div>

    <script>
        // Auto-print option
        if (window.location.search.includes('print=true')) {
            window.print();
        }
    </script>
</body>
</html>
  `;
}