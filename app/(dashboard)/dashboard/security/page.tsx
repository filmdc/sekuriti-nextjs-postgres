'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Trash2, Loader2, Shield } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-space-grid-6">
      <div className="flex items-center gap-space-grid-3">
        <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
        <h1 className="text-enterprise-2xl lg:text-enterprise-3xl font-semibold text-foreground">
          Security Settings
        </h1>
      </div>
      <Card elevated>
        <CardHeader>
          <CardTitle className="flex items-center gap-space-grid-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-space-grid-4" action={passwordAction}>
            <div className="space-y-space-grid-2">
              <Label htmlFor="current-password" className="text-enterprise-sm font-medium">
                Current Password
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
                className="transition-all focus-enterprise"
              />
            </div>
            <div className="space-y-space-grid-2">
              <Label htmlFor="new-password" className="text-enterprise-sm font-medium">
                New Password
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
                className="transition-all focus-enterprise"
              />
            </div>
            <div className="space-y-space-grid-2">
              <Label htmlFor="confirm-password" className="text-enterprise-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
                className="transition-all focus-enterprise"
              />
            </div>
            {passwordState.error && (
              <div className="text-status-critical text-enterprise-sm bg-status-critical/10 p-3 rounded-professional-md border border-status-critical/20">
                {passwordState.error}
              </div>
            )}
            {passwordState.success && (
              <div className="text-status-success text-enterprise-sm bg-status-success/10 p-3 rounded-professional-md border border-status-success/20">
                {passwordState.success}
              </div>
            )}
            <Button
              type="submit"
              variant="default"
              size="lg"
              loading={isPasswordPending}
              disabled={isPasswordPending}
            >
              {!isPasswordPending && <Lock className="mr-2 h-4 w-4" />}
              {isPasswordPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-space-grid-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/5 p-4 rounded-professional-md border border-destructive/20 mb-space-grid-4">
            <p className="text-enterprise-sm text-destructive font-medium">
              ⚠️ Account deletion is non-reversible. Please proceed with caution.
            </p>
          </div>
          <form action={deleteAction} className="space-y-space-grid-4">
            <div className="space-y-space-grid-2">
              <Label htmlFor="delete-password" className="text-enterprise-sm font-medium">
                Confirm Password to Delete Account
              </Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
                className="transition-all focus-enterprise"
              />
            </div>
            {deleteState.error && (
              <div className="text-status-critical text-enterprise-sm bg-status-critical/10 p-3 rounded-professional-md border border-status-critical/20">
                {deleteState.error}
              </div>
            )}
            <Button
              type="submit"
              variant="danger"
              size="lg"
              loading={isDeletePending}
              disabled={isDeletePending}
            >
              {!isDeletePending && <Trash2 className="mr-2 h-4 w-4" />}
              {isDeletePending ? 'Deleting Account...' : 'Delete Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
