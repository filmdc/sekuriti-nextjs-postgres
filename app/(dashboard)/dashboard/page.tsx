'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Users, Settings, CreditCard } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="h-[140px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <CreditCard className="h-5 w-5 text-muted-foreground animate-pulse" />
          Team Subscription
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          Team Subscription
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-space-grid-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-grid-4">
            <div className="space-y-space-grid-2">
              <div className="flex items-center gap-space-grid-2">
                <span className="font-semibold text-enterprise-lg">
                  {teamData?.planName || 'Free'}
                </span>
                <Badge
                  variant={teamData?.subscriptionStatus === 'active' ? 'success' : 'warning'}
                  size="sm"
                >
                  {teamData?.subscriptionStatus === 'active'
                    ? 'Active'
                    : teamData?.subscriptionStatus === 'trialing'
                    ? 'Trial'
                    : 'Inactive'}
                </Badge>
              </div>
              <p className="text-enterprise-sm text-muted-foreground">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                  ? 'Trial period'
                  : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline" size="default">
                <Settings className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="h-[140px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <Users className="h-5 w-5 text-muted-foreground animate-pulse" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-space-grid-4">
          <div className="flex items-center gap-space-grid-3">
            <div className="size-10 rounded-full bg-muted"></div>
            <div className="space-y-space-grid-2">
              <div className="h-4 w-32 bg-muted rounded-professional-sm"></div>
              <div className="h-3 w-14 bg-muted rounded-professional-sm"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-space-grid-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatusIndicator
            status="info"
            variant="minimal"
            message="No team members yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Team Members ({teamData.teamMembers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-space-grid-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between p-3 rounded-professional-md border border-border/50 transition-professional hover:bg-accent/50">
              <div className="flex items-center gap-space-grid-3">
                <Avatar className="shadow-professional-xs">
                  {/*
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-space-grid-1">
                  <p className="font-semibold text-enterprise-base">
                    {getUserDisplayName(member.user)}
                  </p>
                  <Badge
                    variant={member.role === 'owner' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    {member.role}
                  </Badge>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline-danger"
                    size="sm"
                    loading={isRemovePending}
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <div className="mt-space-grid-4 text-status-critical text-enterprise-sm bg-status-critical/10 p-3 rounded-professional-md border border-status-critical/20">
            {removeState.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <PlusCircle className="h-5 w-5 text-muted-foreground animate-pulse" />
          Invite Team Member
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-space-grid-2">
          <PlusCircle className="h-5 w-5 text-muted-foreground" />
          Invite Team Member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-space-grid-4">
          <div className="space-y-space-grid-2">
            <Label htmlFor="email" className="text-enterprise-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter team member's email"
              required
              disabled={!isOwner}
              className="transition-professional focus-enterprise"
            />
          </div>
          <div className="space-y-space-grid-3">
            <Label className="text-enterprise-sm font-medium">Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex gap-space-grid-6"
              disabled={!isOwner}
            >
              <div className="flex items-center gap-space-grid-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member" className="text-enterprise-sm">Member</Label>
              </div>
              <div className="flex items-center gap-space-grid-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner" className="text-enterprise-sm">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <div className="text-status-critical text-enterprise-sm bg-status-critical/10 p-3 rounded-professional-md border border-status-critical/20">
              {inviteState.error}
            </div>
          )}
          {inviteState?.success && (
            <div className="text-status-success text-enterprise-sm bg-status-success/10 p-3 rounded-professional-md border border-status-success/20">
              {inviteState.success}
            </div>
          )}
          <Button
            type="submit"
            variant="default"
            size="lg"
            loading={isInvitePending}
            disabled={isInvitePending || !isOwner}
          >
            {!isInvitePending && <PlusCircle className="mr-2 h-4 w-4" />}
            {isInvitePending ? 'Sending Invitation...' : 'Invite Member'}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <StatusIndicator
            status="warning"
            variant="minimal"
            size="sm"
            message="You must be a team owner to invite new members."
          />
        </CardFooter>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 space-y-space-grid-6">
      <div className="flex items-center gap-space-grid-3">
        <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
        <h1 className="text-enterprise-2xl lg:text-enterprise-3xl font-semibold text-foreground">
          Team Settings
        </h1>
      </div>
      <div className="grid gap-space-grid-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Suspense fallback={<SubscriptionSkeleton />}>
            <ManageSubscription />
          </Suspense>
        </div>
        <Suspense fallback={<TeamMembersSkeleton />}>
          <TeamMembers />
        </Suspense>
        <Suspense fallback={<InviteTeamMemberSkeleton />}>
          <InviteTeamMember />
        </Suspense>
      </div>
    </section>
  );
}
