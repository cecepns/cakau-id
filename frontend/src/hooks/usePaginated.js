import { useCallback, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { errMsg } from "@/utils/request";
import useDebounce from "./useDebounce";

export default function usePaginated(url, params = {}) {
  const [rows, setRows] = useState([]);
  const [pg, setPg] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounced = useDebounce(search, 400);
  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get(url, { params: { ...JSON.parse(key), page, limit, search: debounced } });
      setRows(data.data); setPg(data.pagination);
    } catch (e) { setError(errMsg(e)); }
    setLoading(false);
  }, [url, key, page, limit, debounced]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debounced, limit, key]);

  return { rows, pg, search, setSearch, setPage, limit, setLimit, loading, error, reload: load };
}
