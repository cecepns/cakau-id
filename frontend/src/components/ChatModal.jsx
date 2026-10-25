import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Send,
  X,
  Store,
  ExternalLink,
  Check,
  CheckCheck,
} from "lucide-react";
import { api, FILE_URL } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui";

export default function ChatModal({
  open,
  onClose,
  seller,
  product,
  initialMessage,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(initialMessage || "");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!open || !seller?.id || !user) return;
    let active = true;

    async function initChat() {
      setLoading(true);
      try {
        // Start or get existing conversation
        const { data: resStart } = await api.post(API_ENDPOINTS.CHATS.START, {
          seller_id: seller.id,
          product_id: product?.id,
        });

        if (active && resStart.data) {
          setConversation(resStart.data);
          // Fetch existing messages
          const { data: resMsg } = await api.get(
            API_ENDPOINTS.CHATS.MESSAGES(resStart.data.id),
          );
          if (active) {
            setMessages(resMsg.data || []);
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (err) {
        if (active) {
          toast.error(
            err.response?.data?.message || "Gagal membuka percakapan chat",
          );
          onClose();
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initChat();
    return () => {
      active = false;
    };
  }, [open, seller?.id, user, product?.id, onClose]);

  // Periodic polling for new messages when open
  useEffect(() => {
    if (!open || !conversation?.id) return;
    const interval = setInterval(async () => {
      try {
        const { data: resMsg } = await api.get(
          API_ENDPOINTS.CHATS.MESSAGES(conversation.id),
        );
        if (resMsg.data) {
          setMessages(resMsg.data);
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [open, conversation?.id]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg || !conversation?.id || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(
        API_ENDPOINTS.CHATS.MESSAGES(conversation.id),
        {
          message: msg,
          product_id: product?.id || null,
        },
      );
      if (data.data) {
        setMessages((prev) => [...prev, data.data]);
        setText("");
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const handleOpenFullChat = () => {
    onClose();
    if (conversation?.id) {
      navigate(`/chats?id=${conversation.id}`);
    } else {
      navigate("/chats");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="flex flex-col w-full max-w-lg h-[620px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-600 to-teal-700 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Store size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate leading-tight">
                {seller?.store_name || seller?.name || "Toko Penjual"}
              </h3>
              <p className="text-[11px] text-teal-100 flex items-center gap-1">
                <span>Penjual Terverifikasi Cakau ID</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenFullChat}
              className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-xl transition"
              title="Buka tampilan penuh di menu Chat"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Halaman Penuh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/20 transition text-white"
              aria-label="Tutup chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Product Inquired Context Banner */}
        {product && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3 shrink-0">
            <img
              src={FILE_URL + product.images?.[0]}
              alt={product.name}
              className="h-12 w-12 rounded-xl border border-slate-200 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {product.name}
              </p>
              <p className="text-xs font-extrabold text-brand-700">
                {rupiah(product.price)}
              </p>
            </div>
            {product.operational_hours && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                {product.operational_hours}
              </span>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
              <Spinner size="md" />
              <span className="text-xs">Memuat percakapan...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 space-y-2">
              <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-1">
                <MessageCircle size={24} />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                Belum ada percakapan
              </p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Kirim pesan pertama Anda untuk menanyakan stok, varian, atau jam
                pengiriman toko.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                      isMine
                        ? "bg-brand-600 text-white rounded-br-xs"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                    }`}
                  >
                    {m.product && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs flex items-center gap-2 border ${
                          isMine
                            ? "bg-brand-700/60 border-brand-500 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      >
                        {m.product.image && (
                          <img
                            src={FILE_URL + m.product.image}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold truncate">{m.product.name}</p>
                          <p className="font-extrabold text-[11px] opacity-90">
                            {rupiah(m.product.price)}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {m.message}
                    </p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMine ? "text-brand-100" : "text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(m.created_at).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMine &&
                        (m.is_read ? (
                          <CheckCheck size={12} className="text-teal-200" />
                        ) : (
                          <Check size={12} />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            className="input flex-1 !text-sm !py-2.5 !rounded-2xl"
            placeholder="Ketik pesan untuk penjual..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading || sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim() || sending || loading}
            className="h-10 w-10 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition shadow-sm hover:shadow shrink-0 disabled:opacity-40"
            aria-label="Kirim pesan"
          >
            <Send size={17} className={sending ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
