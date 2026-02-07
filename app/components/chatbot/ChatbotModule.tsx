"use client";

import { useEffect, useRef, useState } from "react";
import {
  MessageSquareText,
  SendHorizontal,
  CornerDownLeft,
  UploadCloud,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { useChat } from "ai/react";

type MessageKind = "text" | "policy" | "promotion";

interface Citation {
  title: string;
  clause: string;
  source: string;
  page?: number;
}

type MessageMeta = {
  timestamp?: string;
  kind?: MessageKind;
  citations?: Citation[];
  checklist?: string[];
};

interface PolicyUploadStatus {
  id: string;
  name: string;
  status: "queued" | "ingested" | "failed";
  detail?: string;
  context?: string;
}

interface DocAttachment {
  id: string;
  name: string;
  status: "ready" | "processing" | "failed";
  context?: string;
}

interface AddressFormState {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const quickPrompts = [
  "Can I expense coworking space?",
  "How many days of leave?",
  "Update my address",
  "What is the promotion criteria?",
];

const promotionChecklist = [
  "Consistent performance at current level (2+ quarters)",
  "Impactful project delivery with measurable outcomes",
  "Demonstrated leadership or mentorship",
  "Role scope aligned with next level expectations",
];

const baseAddressForm: AddressFormState = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function createTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isLeaveBalanceQuestion(text: string) {
  return /how many days of leave|leave balance|days of leave/i.test(text);
}

function isPolicyQuestion(text: string) {
  return /policy|coworking|expense|remote work/i.test(text);
}

function isAddressUpdate(text: string) {
  return /update my address/i.test(text);
}

function isPromotionQuestion(text: string) {
  return /promotion|promoted|promotion criteria/i.test(text);
}

export default function ChatbotModule() {
  const [messageMeta, setMessageMeta] = useState<Record<string, MessageMeta>>({
    welcome: { timestamp: createTimestamp() },
  });
  const [isRouting, setIsRouting] = useState(false);
  const [profileEmail] = useState("sarah.chen@company.com");
  const [policyUploads, setPolicyUploads] = useState<PolicyUploadStatus[]>([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [policyContext, setPolicyContext] = useState("");
  const [docAttachments, setDocAttachments] = useState<DocAttachment[]>([]);
  const [documentContext, setDocumentContext] = useState("");
  const [isPreparingDocs, setIsPreparingDocs] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(baseAddressForm);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [promotionStatus, setPromotionStatus] = useState<"idle" | "pending_review">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    setInput,
    setMessages,
    append,
    isLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      policyContext,
      documentContext,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I’m your HR operations assistant. I can answer policy questions, process requests, and connect to ChatGPT when configured.",
      },
    ],
  });

  const isBusy = isLoading || isRouting;
  const canSend = input.trim().length > 0 && !isBusy;

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isBusy]);

  useEffect(() => {
    setMessageMeta((prev) => {
      let changed = false;
      const next = { ...prev };
      messages.forEach((message) => {
        if (!next[message.id]?.timestamp) {
          next[message.id] = {
            ...next[message.id],
            timestamp: createTimestamp(),
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [messages]);

  const addAssistantMessage = (content: string, meta?: MessageMeta) => {
    const id = `assistant-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: "assistant", content }]);
    setMessageMeta((prev) => ({
      ...prev,
      [id]: {
        timestamp: createTimestamp(),
        ...meta,
      },
    }));
  };

  const handleSend = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isBusy) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: trimmed,
    };

    setInput("");

    if (isAddressUpdate(trimmed)) {
      setMessages((prev) => [...prev, userMessage]);
      addAssistantMessage("Sure. I’ve opened the address update form. Please confirm the details.");
      setIsAddressModalOpen(true);
      return;
    }

    if (isPromotionQuestion(trimmed)) {
      setMessages((prev) => [...prev, userMessage]);
      addAssistantMessage("Here is the promotion criteria checklist and the review workflow.", {
        kind: "promotion",
        checklist: promotionChecklist,
      });
      return;
    }

    try {
      if (isLeaveBalanceQuestion(trimmed)) {
        setIsRouting(true);
        setMessages((prev) => [...prev, userMessage]);
        const response = await fetch(
          `/api/profile/leave-balance?email=${encodeURIComponent(profileEmail)}`
        );
        const data = await response.json();
        addAssistantMessage(`You have ${data.leaveBalance ?? 12} days left.`);
        setIsRouting(false);
        return;
      }

      if (isPolicyQuestion(trimmed)) {
        setIsRouting(true);
        setMessages((prev) => [...prev, userMessage]);
        const response = await fetch("/api/policy/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        });
        const data = await response.json();
        addAssistantMessage(data.answer, {
          kind: "policy",
          citations: data.citations ?? [],
        });
        setIsRouting(false);
        return;
      }

      await append(userMessage, { body: { policyContext, documentContext } });
    } catch (error) {
      console.error("Chat error:", error);
      addAssistantMessage("Something went wrong while connecting. Please try again.");
    } finally {
      setIsRouting(false);
    }
  };

  const handleDocAttach = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = Array.from(files).slice(0, 2);
    const newItems = selected.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      status: "processing" as const,
    }));
    setDocAttachments((prev) => [...newItems, ...prev].slice(0, 4));
    setIsPreparingDocs(true);

    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/chat/prepare-docs", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        const documents: Array<{ name: string; context: string }> = data.documents ?? [];
        const contextMap = new Map(documents.map((doc) => [doc.name, doc.context]));

        setDocAttachments((prev) =>
          prev.map((item) =>
            newItems.some((newItem) => newItem.id === item.id)
              ? {
                  ...item,
                  status: "ready",
                  context: contextMap.get(item.name) ?? data.combinedContext ?? "",
                }
              : item
          )
        );

        const combined = documents.map((doc) => doc.context).join("\n");
        setDocumentContext(combined || data.combinedContext || "");
        addAssistantMessage("Document attached. I can reference it in the next answer.");
      } else {
        setDocAttachments((prev) =>
          prev.map((item) =>
            newItems.some((newItem) => newItem.id === item.id)
              ? { ...item, status: "failed" }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Prepare docs error:", error);
      setDocAttachments((prev) =>
        prev.map((item) =>
          newItems.some((newItem) => newItem.id === item.id)
            ? { ...item, status: "failed" }
            : item
        )
      );
    } finally {
      setIsPreparingDocs(false);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocAttachments((prev) => {
      const next = prev.filter((doc) => doc.id !== id);
      const combined = next.map((doc) => doc.context || "").filter(Boolean).join("\n");
      setDocumentContext(combined);
      return next;
    });
  };

  const handlePolicyUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selected = Array.from(files).slice(0, 2);
    const newItems = selected.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      status: "queued" as const,
    }));

    setPolicyUploads((prev) => [...newItems, ...prev].slice(0, 4));
    setIsIngesting(true);

    try {
      const formData = new FormData();
      selected.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/policy/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && Array.isArray(data.documents)) {
        const context = data.documents
          .flatMap((doc: { title: string; clauses: { text: string; source: string; page?: number }[] }) =>
            doc.clauses.map(
              (clause) =>
                `- ${clause.text} (${doc.title}${clause.page ? ` p.${clause.page}` : ""})`
            )
          )
          .join("\n");
        if (context) {
          setPolicyContext(context);
          addAssistantMessage("Policies uploaded. I can now reference these documents in chat.");
        }
      }

      setPolicyUploads((prev) =>
        prev.map((item) =>
          newItems.some((newItem) => newItem.id === item.id)
            ? {
                ...item,
                status: response.ok ? "ingested" : "failed",
                detail: response.ok
                  ? `Stored in ${data.storage === "memory" ? "memory" : "Pinecone-ready"}`
                  : "Upload failed",
                context:
                  response.ok && Array.isArray(data.documents)
                    ? data.documents
                        .flatMap(
                          (doc: {
                            title: string;
                            clauses: { text: string; source: string; page?: number }[];
                          }) =>
                            doc.clauses.map(
                              (clause) =>
                                `- ${clause.text} (${doc.title}${clause.page ? ` p.${clause.page}` : ""})`
                            )
                        )
                        .join("\n")
                    : undefined,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Policy ingest error:", error);
      setPolicyUploads((prev) =>
        prev.map((item) => ({
          ...item,
          status: "failed",
          detail: "Upload failed",
        }))
      );
    } finally {
      setIsIngesting(false);
    }
  };

  const handleRemovePolicy = (id: string) => {
    setPolicyUploads((prev) => {
      const next = prev.filter((policy) => policy.id !== id);
      const combined = next
        .map((policy) => policy.context || "")
        .filter(Boolean)
        .join("\n");
      setPolicyContext(combined);
      return next;
    });
  };

  const validateAddress = (form: AddressFormState) => {
    const nextErrors: Record<string, string> = {};
    if (!form.line1.trim()) nextErrors.line1 = "Street address is required.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";
    return nextErrors;
  };

  const handleAddressSubmit = async () => {
    const nextErrors = validateAddress(addressForm);
    setAddressErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmittingAddress(true);
    try {
      const response = await fetch("/api/profile/update-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profileEmail,
          address: addressForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      addAssistantMessage(
        "Address updated successfully. I’ve saved the new details to your profile."
      );
      setIsAddressModalOpen(false);
      setAddressForm(baseAddressForm);
    } catch (error) {
      console.error("Address update error:", error);
      addAssistantMessage("I couldn’t update the address. Please try again or contact HR.");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handlePromotionRequest = async () => {
    try {
      const response = await fetch("/api/promotion/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profileEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setPromotionStatus("pending_review");
        addAssistantMessage(`Review request submitted. Status: ${data.status ?? "pending_review"}.`);
      } else {
        addAssistantMessage("Unable to submit the review request. Please try again.");
      }
    } catch (error) {
      console.error("Promotion request error:", error);
      addAssistantMessage("Unable to submit the review request. Please try again.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="flex h-[80vh] min-h-[540px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div ref={listRef} className="flex-1 space-y-4 overflow-auto px-6 py-6">
          {messages.map((message) => {
            const meta = messageMeta[message.id];
            return (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>

                {meta?.kind === "policy" && meta.citations?.length ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                    <p className="mb-2 font-semibold text-slate-700">Citations</p>
                    <ul className="space-y-2">
                      {meta.citations.map((citation, index) => (
                        <li key={`${citation.source}-${index}`} className="rounded-lg bg-slate-50 p-2">
                          <p className="text-[11px] font-semibold text-slate-500">{citation.title}</p>
                          <p className="mt-1">“{citation.clause}”</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {citation.source}
                            {citation.page ? ` · Page ${citation.page}` : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {meta?.kind === "promotion" && meta.checklist?.length ? (
                  <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Criteria checklist
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {meta.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <ClipboardCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={handlePromotionRequest}
                      disabled={promotionStatus === "pending_review"}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {promotionStatus === "pending_review" ? "Review Requested" : "Request Review"}
                    </button>
                  </div>
                ) : null}

                <p
                  className={`mt-2 text-[11px] ${
                    message.role === "user" ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {meta?.timestamp ?? ""}
                </p>
              </div>
              </div>
            );
          })}

          {isBusy && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                  <span>Vera is typing…</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <MessageSquareText className="h-5 w-5 text-slate-400" />
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend(input);
                  }
                }}
                rows={1}
                placeholder="Ask for HR guidance, policy drafts, or employee support..."
                className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(event) => handleDocAttach(event.target.files)}
                  disabled={isPreparingDocs}
                />
                <UploadCloud className="h-4 w-4" />
                Attach PDF
              </label>
              <button
                type="button"
                onClick={() => handleSend(input)}
                disabled={!canSend}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <SendHorizontal className="h-4 w-4" />
                Send
              </button>
            </div>
            <p className="flex items-center gap-2 text-xs text-slate-400">
              <CornerDownLeft className="h-3.5 w-3.5" />
              Press Enter to send, Shift + Enter for a new line.
            </p>
            {docAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {docAttachments.map((doc) => (
                  <span
                    key={doc.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                      doc.status === "ready"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : doc.status === "failed"
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {doc.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="rounded-full p-0.5 text-current/70 transition hover:text-current"
                      aria-label={`Remove ${doc.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Policy library</h3>
              <p className="text-xs text-slate-500">Upload 1-2 PDFs for Pinecone ingestion.</p>
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            <FileText className="h-6 w-6" />
            <span>Drag & drop or click to upload PDFs</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(event) => handlePolicyUpload(event.target.files)}
              disabled={isIngesting}
            />
          </label>
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            {policyUploads.length === 0 ? (
              <p>No policies uploaded yet.</p>
            ) : (
              policyUploads.map((upload) => (
                <div key={upload.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span>{upload.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          upload.status === "ingested"
                            ? "bg-emerald-50 text-emerald-600"
                            : upload.status === "failed"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {upload.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePolicy(upload.id)}
                        className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
                        aria-label={`Remove ${upload.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {upload.detail && <p className="mt-1 text-[11px] text-slate-400">{upload.detail}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Update address"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Street address</label>
            <input
              value={addressForm.line1}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {addressErrors.line1 && <p className="mt-1 text-xs text-rose-500">{addressErrors.line1}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400">Address line 2</label>
            <input
              value={addressForm.line2}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400">City</label>
              <input
                value={addressForm.city}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {addressErrors.city && <p className="mt-1 text-xs text-rose-500">{addressErrors.city}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400">State</label>
              <input
                value={addressForm.state}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400">Postal code</label>
              <input
                value={addressForm.postalCode}
                onChange={(event) =>
                  setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {addressErrors.postalCode && (
                <p className="mt-1 text-xs text-rose-500">{addressErrors.postalCode}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400">Country</label>
              <input
                value={addressForm.country}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {addressErrors.country && (
                <p className="mt-1 text-xs text-rose-500">{addressErrors.country}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddressSubmit}
            disabled={isSubmittingAddress}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmittingAddress ? "Updating..." : "Save address"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
