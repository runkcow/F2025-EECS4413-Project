
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useCatalogApi from "../api/catalogApi";
import useCartApi from "../api/cartApi";

import ProductCard from "../components/ProductCard";

import "../style.css";
import Pagination from "../components/Pagination";

export default function Search() 
{
  const { getProducts, getBrandByCategoryId, getAllCategories, getProductsTotal, changeProductStock } = useCatalogApi();
  const { getCartByUserId, addCartItem, changeCartQty } = useCartApi();

  const { user } = useAuth();
  const admin = (user !== null && user.access_id === 2);

  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState({});
  
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const keyword = searchParams.get("keyword") || null;
  const sortname = searchParams.get("sortname") || "name-asc";
  const category = searchParams.get("category") || 0;
  const brand = searchParams.get("brand") || 0;

  // initialize some stuff
  useEffect(() => {
    getAllCategories().then(setCategories);
    if (!admin) { getCartByUserId().then(setCart); }
  }, [category]);
  
  // update brands when category changes
  useEffect(() => {
    getBrandByCategoryId(category).then(setBrands);
  }, [category]);
  
  // update results when anything changes
  useEffect(() => {
    async function fetchProducts() {
      try {
        let options = {};
        if (keyword != null) { options.keyword = keyword; }
        if (sortname != null) 
        {
          let sort = sortname.split("-"); 
          options.sortname = sort[0];
          options.sortdirection = (sort[1] == "desc"); 
        }
        if (category != 0) { options.category_id = category; }
        if (brand != 0) { options.brand_id = brand; }
        options.page = page;
        const results = await getProducts(options); // optional params
        setProducts(results);
        const total = await getProductsTotal(options);
        setTotalPages(Math.ceil(total / 20));
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    window.scrollTo({ top: 0 });
  }, [searchParams]);
  
  const updateFilters = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters
    });
  };

  const handleAction = (product_id, qty) => {
    if (admin) { changeProductStock(product_id, qty); }
    else
    {
      let newCart = {...cart};
      if (newCart[product_id] !== undefined) { newCart[product_id] += qty; changeCartQty(product_id, newCart[product_id]); setError(""); }
      else if (Object.keys(newCart).length < 20) { newCart[product_id] = qty; addCartItem(product_id, qty); setError(""); }
      else { setError("Cart Limit Reached (20)"); window.scrollTo({ top: 0 }); }
      setCart(newCart);
    }
  };

  const handleChangePage = (page) => {
    updateFilters({ page: page });
  };

  if (loading) { return <span>Loading products...</span> }

  return (
    <div className="search-page">
      <form className="search-config" onSubmit={(e) => {
        updateFilters({ keyword: e.target.elements.keyword.value, page: 1 });
        e.preventDefault();
      }}>
        <input className="search-bar" type="text" name="keyword" placeholder="Search for products..." defaultValue={keyword} />
        <select name="sort" value={sortname} onChange={(e) => updateFilters({ sortname: e.target.value, page: 1 })}>
          <option key="name-asc" value="name-asc">Name ↑</option>
          <option key="name-desc" value="name-desc">Name ↓</option>
          <option key="price-asc" value="price-asc">Price ↑</option>
          <option key="price-desc" value="price-desc">Price ↓</option>
        </select>
        <select name="category" value={category} onChange={(e) => updateFilters({ category: e.target.value, brand: 0, page: 1 })}>
          <option key="0" value="0">All categories</option>
          {categories.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select name="brand" value={brand} onChange={(e) => updateFilters({ brand: e.target.value, page: 1 })}>
          <option key="0" value="0">All brands</option>
          {brands.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </form>
      {products.length === 0 && <p>No products found.</p>}
      {error && <p style={{color:"red"}}>{error}</p>}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            cart={cart[p.id]}
            stock={admin}
            label={admin ? "Change Stock" : "Add to Cart"}
            initQty={admin ? p.stock : 1}
            action={({ product_id, qty }) => handleAction(product_id, qty)}
          />
        ))}
      </div>
      <Pagination page={page} onChangePage={handleChangePage} totalPages={totalPages} />
    </div>
  );
}
