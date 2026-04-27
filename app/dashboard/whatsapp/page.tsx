"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useGetWhatsappChannel,
  useSetWhatsappChannel,
  useIndexEmbeddings,
} from "@/app/api/hooks/whatsapp/useWhatsappChannel";
import PageLayout from "@/components/ui/page-layout";
import { toast } from "sonner";
import {
  MessageSquare,
  Phone,
  Database,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function WhatsappPage() {
  const user = useAuth();
  const orgId = user?.organizationId ?? null;

  const { data: channel, isLoading } = useGetWhatsappChannel(orgId);
  const { mutateAsync: setChannel, isPending: isSaving } = useSetWhatsappChannel(orgId ?? "");
  const { mutateAsync: indexEmbeddings, isPending: isIndexing } = useIndexEmbeddings(orgId ?? "");

  const [phoneInput, setPhoneInput] = useState("");

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/whatsapp/webhook`;

  const handleSaveChannel = async () => {
    if (!phoneInput.trim()) return;
    try {
      await setChannel(phoneInput.trim());
      toast.success("WhatsApp channel saved");
      setPhoneInput("");
    } catch {
      toast.error("Failed to save channel");
    }
  };

  const handleIndex = async () => {
    try {
      await indexEmbeddings();
      toast.success("Knowledge base indexed — bot is ready!");
    } catch {
      toast.error("Indexing failed");
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-green-500" />
          WhatsApp Bot
        </h2>
        <p className="text-muted-foreground mt-1">
          Connect a Twilio WhatsApp number so customers can chat with your AI assistant.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">

        {/* Status card */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-1">
            {channel?.phoneNumber ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            <h3 className="font-semibold">Channel status</h3>
          </div>
          {channel?.phoneNumber ? (
            <p className="text-sm text-muted-foreground ml-8">
              Active on <span className="font-mono font-medium text-foreground">{channel.phoneNumber}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground ml-8">No number configured yet.</p>
          )}
        </div>

        {/* Step 1 — Phone number */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
            <h3 className="font-semibold">Set your Twilio WhatsApp number</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the phone number you've purchased in Twilio (e.g. <span className="font-mono">+13135137270</span>).
            This is the number customers will message.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={channel?.phoneNumber ?? "+13135137270"}
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
            </div>
            <button
              onClick={handleSaveChannel}
              disabled={isSaving || !phoneInput.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </button>
          </div>
        </div>

        {/* Step 2 — Webhook */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
            <h3 className="font-semibold">Configure Twilio webhook</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            In your{" "}
            <a
              href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
            >
              Twilio console <ExternalLink className="h-3 w-3" />
            </a>
            , go to <strong>Messaging → Senders → WhatsApp</strong>, select your number, and set the
            <strong> "When a message comes in"</strong> webhook to:
          </p>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <code className="text-xs flex-1 break-all">{webhookUrl}</code>
            <button onClick={copyWebhook} className="shrink-0 p-1 hover:text-primary transition-colors">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Method: <strong>HTTP POST</strong></p>
          <p className="text-xs text-amber-600 mt-1">
            ⚠ For local dev, use <a href="https://ngrok.com" target="_blank" className="underline">ngrok</a> to expose your backend:
            {" "}<code className="font-mono">ngrok http 8081</code>
          </p>
        </div>

        {/* Step 3 — Index */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
            <h3 className="font-semibold">Build knowledge base</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Index your salon's services, staff, and hours into the AI knowledge base. Re-run this
            whenever you update services or business hours.
          </p>
          <button
            onClick={handleIndex}
            disabled={isIndexing || !channel?.phoneNumber}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            {isIndexing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Indexing...</>
            ) : (
              <><Database className="h-4 w-4" /> Build knowledge base</>
            )}
          </button>
          {!channel?.phoneNumber && (
            <p className="text-xs text-muted-foreground mt-2">Configure a phone number first.</p>
          )}
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-dashed bg-muted/30 p-5">
          <h3 className="font-semibold text-sm mb-3">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Customer sends a WhatsApp message to your Twilio number</li>
            <li>Bot retrieves relevant salon info using semantic search (RAG)</li>
            <li>GPT-4o-mini answers using your services, staff, and availability</li>
            <li>For bookings: bot collects service + staff + time, asks for confirmation, then books</li>
            <li>Conversation history is saved per customer</li>
          </ol>
        </div>

      </div>
    </PageLayout>
  );
}
