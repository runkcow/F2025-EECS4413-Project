import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useOrdersApi from "../api/ordersApi";
import useCatalogApi from "../api/catalogApi";

import OrderCard from "../components/OrderCard";
import Pagination from "../components/Pagination";

export default function Orders()
{
  const { getOrders, getOrdersTotal } = useOrdersApi();
  const { getBrandByCategoryId, getAllCategories } = useCatalogApi();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [rawInput, setRawInput] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const input = searchParams.get("input") || "";
  const brand_id = parseInt(searchParams.get("brand_id")) || 0;
  const category_id = parseInt(searchParams.get("category_id")) || 0;
  const start_time = searchParams.get("start_time") || "";
  const end_time = searchParams.get("end_time") || "";

  // initialize categories & brands
  useEffect(() => {
    getAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    getBrandByCategoryId(category_id).then(setBrands);
  }, [category_id]);

  // processes input into product: and user:
  function processInput (input) {
    const KEY_MAP = { "order": "id", "product": "product_name", "user": "username" };
    const REGEX = /(\w+):([^:]+?)(?=\s+\w+:|$)/g;
    
    let result = {};
    let matched = false;

    let match;
    while ((match = REGEX.exec(input)) !== null) {
      const [, key, value] = match;
      if (KEY_MAP[key]) {
        result[KEY_MAP[key]] = value.trim();
        matched = true;
      }
    }

    if (!matched) { result.keyword = input; }
    return result;
  }

  // get orders
  useEffect(() => {
    (async () => {
      try {
        let options = Object.fromEntries(Object.entries({ page, input, start_time }).filter((a) => a[1] !== undefined && a[1] !== null && a[1] !== ""));
        options = { ...options, ...processInput(input) };
        if (category_id !== 0) { options.category_id = category_id; }
        if (brand_id !== 0) { options.brand_id = brand_id; }
        if (end_time !== "") { options.end_time = `${end_time} 23:59:59`; }
        let results = await getOrders(options);
        setOrders(results);
        const total = await getOrdersTotal(options);
        setTotalPages(Math.ceil(total / 20));
      } catch (err) {
        console.error("Failed to get orders:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const updateFilters = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters
    });
  }

  // TODO: make this append, needs to check if requested parameter already exists in "input" and override if so
  const updateInput = (append) => {
    updateFilters({ input: append });
  }

  const handleChangePage = (p) => {
    if (page !== p) { updateFilters({ p }); }
  }

  if (loading) { return <span>Loading orders...</span> }

  return (
    <div className="search-page">
      <form className="search-config" onSubmit={(e) => {
        e.preventDefault();
        updateFilters({ input: e.target.elements.input.value, page: 1 });
      }}>
        <input className="search-bar" type="text" name="input" placeholder="Search for orders..." defaultValue={input} />
        <select  name="category" value={category_id} onChange={(e) => updateFilters({ category_id: e.target.value, brand_id: 0, page: 1 })}>
          <option key="0" value="0">All categories</option>
          {categories.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select name="brand" value={brand_id} onChange={(e) => updateFilters({ brand_id: e.target.value, page: 1 })}>
          <option key="0" value="0">All brands</option>
          {brands.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <label style={{display:"flex"}}><div className="search-config-text">Start:</div><input type="date" name="start_time" value={start_time} onChange={(e) => updateFilters({ start_time: e.target.value, page: 1 })} /></label>
        <label style={{display:"flex"}}><div className="search-config-text">End:</div><input type="date" name="end_time" value={end_time} onChange={(e) => updateFilters({ end_time: e.target.value, page: 1 })} /></label>
      </form>
      {orders.length === 0 && <p>No orders found.</p>}
      <div>
        {orders.map((a) => (
          <OrderCard
            key={`${a.id}-${a.product_id}`} 
            updateInput={updateInput}
            order={a}
          />
        ))}
      </div>
      <Pagination page={page} onChangePage={handleChangePage} totalPages={totalPages} />
    </div>
  );
}
