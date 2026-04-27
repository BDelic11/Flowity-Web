"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { saveNotificationPrefs } from "@/actions/settings-actions";
import { toast } from "sonner";

export function SettingsNotificationsTab({
  initialPrefs,
}: {
  initialPrefs: {
    email: boolean;
    sms: boolean;
    types: { newBooking: boolean; cancellations: boolean; reminders: boolean };
  };
}) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState(initialPrefs.email);
  const [sms, setSms] = useState(initialPrefs.sms);
  const [types, setTypes] = useState(initialPrefs.types);

  function handleSave() {
    start(async () => {
      await saveNotificationPrefs({ email, sms, types });
      toast.success("Notification preferences saved");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch checked={email} onCheckedChange={setEmail} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SMS Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via SMS
            </p>
          </div>
          <Switch checked={sms} onCheckedChange={setSms} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>New Bookings</Label>
            <Switch
              checked={types.newBooking}
              onCheckedChange={(v) =>
                setTypes((t) => ({ ...t, newBooking: v }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Cancellations</Label>
            <Switch
              checked={types.cancellations}
              onCheckedChange={(v) =>
                setTypes((t) => ({ ...t, cancellations: v }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Appointment Reminders</Label>
            <Switch
              checked={types.reminders}
              onCheckedChange={(v) => setTypes((t) => ({ ...t, reminders: v }))}
            />
          </div>
        </div>

        <Separator className="my-4" />
        <Button onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
