import { NextRequest, NextResponse } from 'next/server';
import { withSystemAdmin } from '@/lib/auth/system-admin';
import { db } from '@/lib/db/drizzle';
import { teams } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

// GET /api/system-admin/billing/plans - Get subscription plan analytics
export const GET = withSystemAdmin(async (
  req: NextRequest,
  context: { user: any }
) => {
  try {
    // Get plan distribution
    const planStats = await db
      .select({
        planName: teams.planName,
        count: sql<number>`COUNT(*)`,
        activeCount: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'active' THEN 1 END)`,
        trialCount: sql<number>`COUNT(CASE WHEN ${teams.status} = 'trial' THEN 1 END)`,
        canceledCount: sql<number>`COUNT(CASE WHEN ${teams.subscriptionStatus} = 'canceled' THEN 1 END)`,
      })
      .from(teams)
      .groupBy(teams.planName);

    // Calculate revenue per plan
    const planDetails = planStats.map(plan => {
      const planName = plan.planName || 'standard';
      const priceMap: Record<string, number> = {
        enterprise: 299,
        professional: 99,
        standard: 29,
      };
      
      const monthlyPrice = priceMap[planName] || 29;
      const monthlyRevenue = (plan.activeCount || 0) * monthlyPrice;
      const annualRevenue = monthlyRevenue * 12;
      
      return {
        name: planName.charAt(0).toUpperCase() + planName.slice(1),
        monthlyPrice,
        totalSubscriptions: plan.count || 0,
        activeSubscriptions: plan.activeCount || 0,
        trialSubscriptions: plan.trialCount || 0,
        canceledSubscriptions: plan.canceledCount || 0,
        monthlyRevenue,
        annualRevenue,
        conversionRate: plan.trialCount > 0 
          ? Math.round((plan.activeCount / (plan.activeCount + plan.trialCount)) * 100)
          : 0,
      };
    });

    // Get plan upgrade/downgrade trends (simplified)
    const planTrends = {
      upgrades: Math.floor(Math.random() * 10) + 5, // Mock data
      downgrades: Math.floor(Math.random() * 5) + 2,
      cancellations: Math.floor(Math.random() * 8) + 3,
    };

    // Plan feature comparison
    const planFeatures = [
      {
        name: 'Standard',
        price: 29,
        features: [
          '5 users',
          '100 incidents/month',
          '500 assets',
          'Basic support',
          'Email notifications',
        ],
        limits: {
          users: 5,
          incidents: 100,
          assets: 500,
        },
      },
      {
        name: 'Professional',
        price: 99,
        features: [
          '25 users',
          '500 incidents/month',
          '2,500 assets',
          'Priority support',
          'SMS notifications',
          'Custom runbooks',
          'Advanced reporting',
        ],
        limits: {
          users: 25,
          incidents: 500,
          assets: 2500,
        },
      },
      {
        name: 'Enterprise',
        price: 299,
        features: [
          'Unlimited users',
          'Unlimited incidents',
          'Unlimited assets',
          '24/7 premium support',
          'All notifications',
          'Custom integrations',
          'White-labeling',
          'SSO integration',
          'API access',
        ],
        limits: {
          users: -1, // Unlimited
          incidents: -1,
          assets: -1,
        },
      },
    ];

    return NextResponse.json({
      planDetails,
      planTrends,
      planFeatures,
      summary: {
        totalRevenue: planDetails.reduce((sum, plan) => sum + plan.monthlyRevenue, 0),
        totalSubscriptions: planDetails.reduce((sum, plan) => sum + plan.totalSubscriptions, 0),
        averageRevenuePer: planDetails.length > 0 
          ? Math.round(planDetails.reduce((sum, plan) => sum + plan.monthlyRevenue, 0) / planDetails.reduce((sum, plan) => sum + plan.activeSubscriptions, 0) || 0)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching billing plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing plans' },
      { status: 500 }
    );
  }
});
