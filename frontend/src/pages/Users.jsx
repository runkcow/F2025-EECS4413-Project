
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../UserProvider";
import useUserApi from "../api/userApi";

import Pagination from "../components/Pagination";

export default function Users()
{
  const { getUsers, getUsersTotal } = useUserApi();
  
  const { user } = useAuth();

  const [userData, setUserData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const keyword = searchParams.get("keyword") || "";
  const sortname = searchParams.get("sortname") || "name-asc";

  useEffect(() => {
    (async () => {
      // sort by username only
      const options = { page, keyword, sortname: "username", sortdirection: (sortname !== "name-asc") };
      const users = await getUsers(options);
      setUserData(users);
      const total = await getUsersTotal(options);
      setTotalPages(Math.ceil(total / 20));
    })();
  }, [searchParams])

  const updateFilters = (newFilters) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...newFilters
    });
  };

  const handleChangePage = (p) => {
    if (page !== p) { updateFilters({ p }); }
  }

  return (
    <div className="info-wrapper">
      <form className="info-class">
        <div style={{display:"flex", flexDirection:"row", margin:"16px 0"}}>
          <input style={{fontSize:"16px", width:"100%"}} type="text" name="keyword" placeholder="Search for users..." defaultValue={keyword} />
          <select name="sort" value={sortname} onChange={(e) => updateFilters({ sortname: e.target.value, page: 1 })}>
            <option key="name-asc" value="name-asc">Name ↑</option>
            <option key="name-desc" value="name-desc">Name ↓</option>
          </select>
        </div>
        {userData.map((a) => (
          <div key={a.id} className="info-input" style={{margin:"4px 0"}}>
            <span>{a.username}</span>
            <Link className="btn" style={{padding:"2px 16px"}} to={`/settings/${a.id}`}>Edit</Link>
          </div>
        ))}
        <Pagination page={page} onChangePage={handleChangePage} totalPages={totalPages} />
      </form>
    </div>
  )
}
