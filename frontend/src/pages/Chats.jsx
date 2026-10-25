import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  Store,
  User as UserIcon,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Phone,
  Package,
} from "lucide-react";
import { api, FILE_URL } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { rupiah, stripHtml } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui";

export default function Chats() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConvId = searchParams.get("id");
  const querySellerId = searchParams.get("seller_id");
  const queryProductId = searchParams.get("product_id");

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState(null);

  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch list of conversations
  const loadConversations = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingList(true);
      try {
        const { data } = await api.get(API_ENDPOINTS.CHATS.LIST, {
          params: { search: search.trim() || undefined, limit: 50 },
        });
        setConversations(data.data || []);
      } catch (err) {
        if (!silent) {
          toast.error(
            err.response?.data?.message || "Gagal memuat daftar chat",
          );
        }
      } finally {
        if (!silent) setLoadingList(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadConversations]);

  // Load messages for an active conversation
  const loadMessages = useCallback(async (convId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.CHATS.MESSAGES(convId));
      setMessages(data.data || []);
      if (!silent) setTimeout(scrollToBottom, 50);
    } catch (err) {
      if (!silent) {
        toast.error(err.response?.data?.message || "Gagal memuat pesan");
      }
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // Handle URL query parameters to auto-open or start a chat
  useEffect(() => {
    let cancelled = false;

    async function handleQueryInit() {
      if (querySellerId) {
        // Start or retrieve conversation with this seller
        try {
          const { data: resStart } = await api.post(API_ENDPOINTS.CHATS.START, {
            seller_id: querySellerId,
            product_id: queryProductId || undefined,
          });
          if (!cancelled && resStart.data) {
            setActiveConv(resStart.data);
            setSearchParams({ id: resStart.data.id }, { replace: true });
            loadMessages(resStart.data.id);
            loadConversations(true);

            // Fetch attached product info if provided
            if (queryProductId) {
              api
                .get(API_ENDPOINTS.PRODUCT(queryProductId))
                .then(({ data }) => {
                  if (!cancelled) setAttachedProduct(data.data);
                })
                .catch(() => {});
            }
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Gagal membuka chat");
        }
      } else if (queryConvId && conversations.length > 0 && !activeConv) {
        const found = conversations.find((c) => String(c.id) === queryConvId);
        if (found) {
          setActiveConv(found);
          loadMessages(found.id);
        } else {
          // Fetch direct conversation detail
          api
            .get(API_ENDPOINTS.CHATS.DETAIL(queryConvId))
            .then(({ data }) => {
              if (!cancelled && data.data) {
                setActiveConv(data.data);
                loadMessages(data.data.id);
              }
            })
            .catch(() => {});
        }
      }
    }

    handleQueryInit();
    return () => {
      cancelled = true;
    };
  }, [
    querySellerId,
    queryProductId,
    queryConvId,
    conversations,
    activeConv,
    setSearchParams,
    loadMessages,
    loadConversations,
  ]);

  // Polling for updates on active conversation and conversation list
  useEffect(() => {
    if (!activeConv?.id) return;

    pollingRef.current = setInterval(() => {
      loadMessages(activeConv.id, true);
      loadConversations(true);
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConv?.id, loadMessages, loadConversations]);

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setAttachedProduct(null);
    setSearchParams({ id: conv.id }, { replace: true });
    loadMessages(conv.id);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg || !activeConv?.id || sending) return;

    setSending(true);
    try {
      const { data } = await api.post(
        API_ENDPOINTS.CHATS.MESSAGES(activeConv.id),
        {
          message: msg,
          product_id: attachedProduct?.id || null,
        },
      );
      if (data.data) {
        setMessages((prev) => [...prev, data.data]);
        setText("");
        setAttachedProduct(null);
        setTimeout(scrollToBottom, 50);
        loadConversations(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (qText) => {
    setText(qText);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PANE: Conversation List ================= */}
        <div
          className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-slate-50/50 shrink-0 ${
            activeConv ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200/80 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <MessageCircle size={20} className="text-brand-600" />
                <span>Pesan & Chat</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {conversations.length} Percakapan
              </span>
            </div>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="input !pl-10 !py-2 !text-xs !rounded-xl"
                placeholder="Cari toko, pembeli, atau pesan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {loadingList ? (
              <div className="flex flex-col items-center justify-center p-8 gap-2 text-slate-400">
                <Spinner size="sm" />
                <span className="text-xs">Memuat daftar pesan...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <MessageCircle size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Belum ada percakapan
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
                  Pesan antara pembeli dan penjual akan tampil di sini.
                </p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConv?.id === c.id;
                const unread = c.unread_count || 0;
                const other = c.other_user || {};
                const name =
                  other.store_name || other.name || "Pengguna Cakau ID";

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectConversation(c)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition ${
                      isSelected
                        ? "bg-brand-50/80 border border-brand-200/80 shadow-2xs"
                        : "hover:bg-white"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
                        {other.store_name ? (
                          <Store size={18} />
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white ring-2 ring-white">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {name}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(c.last_message_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          unread > 0
                            ? "font-bold text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {c.last_message || "Percakapan baru"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT PANE: Active Chat Conversation ================= */}
        <div
          className={`flex-1 flex flex-col bg-white overflow-hidden ${
            activeConv ? "flex" : "hidden md:flex"
          }`}
        >
          {activeConv ? (
            <>
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-xs shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveConv(null)}
                    className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-700 transition"
                    aria-label="Kembali ke daftar pesan"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0">
                    {activeConv.other_user?.store_name ? (
                      <Store size={20} />
                    ) : (
                      <UserIcon size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {activeConv.other_user?.store_name ||
                        activeConv.other_user?.name ||
                        "Chat Toko"}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>
                        {activeConv.other_user?.role === "seller"
                          ? "Penjual / Toko Resmi"
                          : "Pembeli Terverifikasi"}
                      </span>
                    </p>
                  </div>
                </div>

                {activeConv.other_user?.phone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Phone size={12} className="text-brand-600" />
                      {activeConv.other_user.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Attached Product Preview Banner (if currently inquiring about a product) */}
              {attachedProduct && (
                <div className="px-4 py-2.5 bg-brand-50/60 border-b border-brand-100 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={FILE_URL + attachedProduct.images?.[0]}
                      alt=""
                      className="h-10 w-10 rounded-xl border border-brand-200 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {attachedProduct.name}
                      </p>
                      <p className="text-xs font-extrabold text-brand-700">
                        {rupiah(attachedProduct.price)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedProduct(null)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition"
                  >
                    Batal Lampirkan
                  </button>
                </div>
              )}

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/40">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Spinner size="md" />
                    <span className="text-xs">Memuat pesan...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 space-y-3">
                    <div className="h-14 w-14 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-2xs">
                      <MessageCircle size={28} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-sm">
                        Mulai percakapan dengan{" "}
                        {activeConv.other_user?.store_name ||
                          activeConv.other_user?.name}
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Kirim pesan atau tanyakan detail ketersediaan stok, jam
                        buka, atau info pengiriman pesanan Anda.
                      </p>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
                      {[
                        "Halo, apakah stok produk ini masih tersedia?",
                        "Kapan pesanan saya bisa dikirim?",
                        "Bisa dikirim hari ini?",
                        "Jam berapa toko mulai melayani pesanan?",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleQuickQuestion(chip)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition shadow-2xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                            isMine
                              ? "bg-brand-600 text-white rounded-br-xs"
                              : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                          }`}
                        >
                          {/* Attached Product Card Bubble */}
                          {m.product && (
                            <Link
                              to={`/products/${m.product.id}`}
                              className={`mb-2 p-2 rounded-xl text-xs flex items-center gap-2 border transition block hover:opacity-95 ${
                                isMine
                                  ? "bg-brand-700/60 border-brand-500 text-white"
                                  : "bg-slate-50 border-slate-200 text-slate-900"
                              }`}
                            >
                              {m.product.image && (
                                <img
                                  src={FILE_URL + m.product.image}
                                  alt=""
                                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-bold truncate">
                                  {m.product.name}
                                </p>
                                <p className="font-extrabold text-[11px] opacity-90">
                                  {rupiah(m.product.price)}
                                </p>
                              </div>
                            </Link>
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
                              {new Date(m.created_at).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            {isMine &&
                              (m.is_read ? (
                                <CheckCheck
                                  size={12}
                                  className="text-teal-200"
                                />
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

              {/* Input Area */}
              <form
                onSubmit={handleSend}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  className="input flex-1 !text-sm !py-2.5 !rounded-2xl"
                  placeholder="Ketik pesan..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={loadingMessages || sending}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending || loadingMessages}
                  className="h-11 w-11 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition shadow-md shadow-brand-600/20 shrink-0 disabled:opacity-40"
                  aria-label="Kirim pesan"
                >
                  <Send size={18} className={sending ? "animate-pulse" : ""} />
                </button>
              </form>
            </>
          ) : (
            /* Empty selection state on Desktop */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="h-16 w-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                <MessageCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">
                  Pilih Percakapan
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Pilih salah satu percakapan di sebelah kiri untuk melihat pesan
                  atau mulai chat baru dengan penjual/pembeli.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
